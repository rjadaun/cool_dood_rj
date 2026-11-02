import { MAX_REQUEST_FILE_BYTES, validateUpload, type MediaItem } from "./shared";

export async function readMediaResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = response.status === 413
      ? "The hosting upload limit was exceeded. Try a smaller image."
      : response.status === 401 ? "Your session expired. Sign in again to continue."
      : "The request failed. Please try again.";
    throw new Error(typeof data?.error === "string" ? data.error : fallback);
  }
  if (!data) throw new Error("The server returned an unexpected response. Please try again.");
  return data as T;
}

/** Keep individual requests below serverless body limits before server optimisation. */
export async function prepareImage(file: File): Promise<File> {
  const error = validateUpload(file);
  if (error) throw new Error(error);
  if (file.size <= MAX_REQUEST_FILE_BYTES) return file;
  if (file.type === "image/svg+xml") throw new Error("SVG files must be smaller than 4 MB. Export a smaller SVG or PNG.");

  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error("This image could not be opened. Export it as JPEG, PNG or WebP and try again."); }
  try {
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.8, 0.65]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= MAX_REQUEST_FILE_BYTES) return new File([blob], file.name, { type: blob.type });
    }
    throw new Error("This image is too large after resizing. Export a smaller image and try again.");
  } finally { bitmap.close(); }
}

export async function uploadMedia(file: File, folder = "uploads"): Promise<MediaItem> {
  const prepared = await prepareImage(file);
  const body = new FormData();
  body.append("files", prepared);
  body.append("folder", folder);
  const data = await readMediaResponse<{ items: MediaItem[] }>(await fetch("/api/admin/media", { method: "POST", body }));
  if (!data.items?.[0]) throw new Error("The upload did not return an image. Please refresh the library.");
  return data.items[0];
}
