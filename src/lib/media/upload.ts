import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { processImage } from "./process";
import type { Media } from "@prisma/client";

import { validateUpload } from "./shared";
export { MAX_UPLOAD_BYTES, ALLOWED_MIME } from "./shared";

export interface UploadOptions {
  folder?: string;
  altText?: string;
  caption?: string;
  uploadedById?: string;
}

export class UploadError extends Error {}

/** Validate + optimise + store a file and create a Media record. */
export async function uploadFile(
  file: { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> },
  opts: UploadOptions = {}
): Promise<Media> {
  const error = validateUpload(file);
  if (error) throw new UploadError(error);

  const original = Buffer.from(await file.arrayBuffer());
  const folder = (opts.folder ?? "uploads").replace(/[^a-z0-9-_/]/gi, "").replace(/^\/+|\/+$/g, "") || "uploads";

  const processed = await processImage(original, file.type).catch(() => {
    throw new UploadError("This image is damaged, unsupported or too large to process. Export a JPEG, PNG or WebP and try again.");
  });
  const storage = getStorage();

  let key: string;
  let body: Buffer;
  let contentType: string;
  let width: number | null = null;
  let height: number | null = null;
  let blurDataUrl: string | null = null;

  if (processed) {
    key = `${folder}/${randomUUID()}.${processed.extension}`;
    body = processed.buffer;
    contentType = processed.contentType;
    width = processed.width;
    height = processed.height;
    blurDataUrl = processed.blurDataUrl;
  } else {
    // SVG / passthrough
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    key = `${folder}/${randomUUID()}.${ext}`;
    body = original;
    contentType = file.type;
  }

  const { url, key: storedKey } = await storage.put({ key, body, contentType });

  try {
    return await prisma.media.create({
    data: {
      url,
      key: storedKey,
      filename: file.name,
      mimeType: contentType,
      size: body.length,
      width,
      height,
      blurDataUrl,
      altText: opts.altText,
      caption: opts.caption,
      folder,
      uploadedById: opts.uploadedById,
    },
  });
  } catch (err) {
    await storage.remove(storedKey).catch((cleanupError) => console.error("[media upload cleanup]", cleanupError));
    throw err;
  }
}

export class MediaInUseError extends Error {}

export async function deleteMedia(id: string): Promise<void> {
  // Delete the record only after checking every relation and URL-only reference.
  // Keep storage intact if a database check or deletion fails.
  const media = await prisma.$transaction(async (tx) => {
    const found = await tx.media.findUnique({ where: { id }, include: { _count: true } });
    if (!found) return null;
    const [settings, page, section, post] = await Promise.all([
      tx.siteSetting.findFirst({ where: { OR: [{ logoUrl: found.url }, { faviconUrl: found.url }, { ogImageUrl: found.url }] }, select: { id: true } }),
      tx.page.findFirst({ where: { OR: [{ ogImageId: id }, { content: { contains: found.url } }] }, select: { id: true } }),
      tx.pageSection.findFirst({ where: { OR: [{ imageId: id }, { body: { contains: found.url } }] }, select: { id: true } }),
      tx.blogPost.findFirst({ where: { content: { contains: found.url } }, select: { id: true } }),
    ]);
    if (Object.values(found._count).some((count) => count > 0) || settings || page || section || post) {
      throw new MediaInUseError("This image is used by content. Replace or remove those references before deleting it.");
    }
    await tx.media.delete({ where: { id } });
    return found;
  });
  if (media) {
    // A storage outage may leave an orphan, but must never break published content.
    await getStorage().remove(media.key).catch((err) => console.error("[media storage cleanup]", err));
  }
}
