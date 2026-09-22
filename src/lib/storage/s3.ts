import { createHash, createHmac } from "node:crypto";
import type { PutObjectInput, PutObjectResult, StorageProvider } from "./types";
import { env } from "@/lib/env";

/**
 * Minimal, dependency-free S3-compatible provider using AWS Signature V4.
 * Works with AWS S3, Cloudflare R2, MinIO, Backblaze B2, etc.
 * Configure via STORAGE_* environment variables.
 */
export class S3StorageProvider implements StorageProvider {
  private bucket = env.storage.bucket;
  private region = env.storage.region || "auto";
  private accessKey = env.storage.accessKey;
  private secretKey = env.storage.secretKey;
  private endpoint = env.storage.endpoint.replace(/\/$/, "");

  publicUrl(key: string): string {
    if (env.storage.publicUrl) {
      return `${env.storage.publicUrl.replace(/\/$/, "")}/${key}`;
    }
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async put({ key, body, contentType }: PutObjectInput): Promise<PutObjectResult> {
    await this.signedRequest("PUT", key, body, contentType);
    return { key, url: this.publicUrl(key) };
  }

  async remove(key: string): Promise<void> {
    await this.signedRequest("DELETE", key, Buffer.alloc(0));
  }

  private async signedRequest(method: string, key: string, body: Buffer, contentType?: string) {
    const url = new URL(`${this.endpoint}/${this.bucket}/${key}`);
    const host = url.host;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const service = "s3";
    const payloadHash = createHash("sha256").update(body).digest("hex");

    const headers: Record<string, string> = {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };
    if (contentType) headers["content-type"] = contentType;

    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((h) => `${h}:${headers[h]}\n`)
      .join("");

    const canonicalRequest = [
      method,
      url.pathname,
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const scope = `${dateStamp}/${this.region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      scope,
      createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const kDate = createHmac("sha256", `AWS4${this.secretKey}`).update(dateStamp).digest();
    const kRegion = createHmac("sha256", kDate).update(this.region).digest();
    const kService = createHmac("sha256", kRegion).update(service).digest();
    const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(url, {
      method,
      headers: { ...headers, Authorization: authorization },
      body: method === "PUT" ? new Uint8Array(body) : undefined,
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`S3 ${method} failed: ${res.status} ${await res.text()}`);
    }
  }
}
