/** Shared by the browser and upload API; no server-only imports. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_REQUEST_FILE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
export const IMAGE_ACCEPT = ALLOWED_MIME.join(",");

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  caption?: string | null;
  width: number | null;
  height: number | null;
  size: number;
}

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return "Use a JPEG, PNG, WebP, AVIF, GIF or SVG image.";
  if (!file.size) return "This file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is larger than the 15 MB limit.";
  return null;
}

export function mediaPage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1_000_000 ? page : 1;
}
