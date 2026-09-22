import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
  width: number;
  height: number;
  blurDataUrl: string;
}

const MAX_DIMENSION = 2560; // cap huge originals while preserving quality

/**
 * Normalises an uploaded image: auto-rotates, caps oversized dimensions,
 * re-encodes to high-quality WebP, and produces a tiny blur placeholder.
 * Non-raster files (e.g. SVG logos) pass through untouched.
 */
export async function processImage(input: Buffer, mimeType: string): Promise<ProcessedImage | null> {
  if (mimeType === "image/svg+xml") return null;
  if (!mimeType.startsWith("image/")) return null;

  const pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();

  const resized = pipeline.resize({
    width: Math.min(meta.width ?? MAX_DIMENSION, MAX_DIMENSION),
    height: Math.min(meta.height ?? MAX_DIMENSION, MAX_DIMENSION),
    fit: "inside",
    withoutEnlargement: true,
  });

  const buffer = await resized.webp({ quality: 82 }).toBuffer();
  const finalMeta = await sharp(buffer).metadata();

  // 16px wide blur placeholder as a data URL.
  const blur = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blur.toString("base64")}`;

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp",
    width: finalMeta.width ?? 0,
    height: finalMeta.height ?? 0,
    blurDataUrl,
  };
}
