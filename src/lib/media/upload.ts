import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { processImage } from "./process";
import type { Media } from "@prisma/client";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

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
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new UploadError(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("File is larger than the 15MB limit.");
  }

  const original = Buffer.from(await file.arrayBuffer());
  const folder = (opts.folder ?? "uploads").replace(/[^a-z0-9-_/]/gi, "");

  const processed = await processImage(original, file.type);
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

  return prisma.media.create({
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
}

export async function deleteMedia(id: string): Promise<void> {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;
  // The site logo is stored as a plain URL rather than a relation, so guard it here.
  const isSiteLogo = await prisma.siteSetting.findFirst({ where: { logoUrl: media.url }, select: { id: true } });
  if (isSiteLogo) throw new Error("This file is the current site logo.");
  await getStorage().remove(media.key);
  await prisma.media.delete({ where: { id } });
}
