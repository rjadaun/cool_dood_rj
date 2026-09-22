import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import type { PutObjectInput, PutObjectResult, StorageProvider } from "./types";

/**
 * Cloudinary storage provider using the signed REST upload API.
 * Dependency-free (fetch + SHA-1 signature). Configure via:
 *   STORAGE_PROVIDER=cloudinary
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * The image is still optimised locally by sharp before upload; Cloudinary
 * stores it and serves it via its CDN (and can transform on the fly).
 */
export class CloudinaryStorageProvider implements StorageProvider {
  private cloudName = env.cloudinary.cloudName;
  private apiKey = env.cloudinary.apiKey;
  private apiSecret = env.cloudinary.apiSecret;

  /** Strip any extension — Cloudinary derives format from the file itself. */
  private toPublicId(key: string): string {
    return key.replace(/\.[^./]+$/, "");
  }

  publicUrl(key: string): string {
    const publicId = this.toPublicId(key);
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }

  /** Cloudinary signature: SHA-1 of sorted `k=v&…` params + api_secret. */
  private sign(params: Record<string, string | number>): string {
    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    return createHash("sha1").update(toSign + this.apiSecret).digest("hex");
  }

  async put({ key, body, contentType }: PutObjectInput): Promise<PutObjectResult> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error("Cloudinary is not configured (CLOUDINARY_* env vars missing).");
    }

    const folder = env.cloudinary.folder ? `${env.cloudinary.folder}/` : "";
    const publicId = `${folder}${this.toPublicId(key)}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signParams = { public_id: publicId, timestamp };
    const signature = this.sign(signParams);

    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(body)], { type: contentType }));
    form.append("api_key", this.apiKey);
    form.append("timestamp", String(timestamp));
    form.append("public_id", publicId);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      { method: "POST", body: form }
    );

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { public_id: string; secure_url: string };
    // Store the returned public_id as the key so remove() can target it exactly.
    return { key: data.public_id, url: data.secure_url };
  }

  async remove(key: string): Promise<void> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) return;

    const publicId = this.toPublicId(key);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign({ public_id: publicId, timestamp });

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", this.apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      { method: "POST", body: form }
    );
    // Ignore "not found" — deletion must be idempotent.
    if (!res.ok) {
      console.error(`[cloudinary] destroy failed: ${res.status} ${await res.text()}`);
    }
  }
}
