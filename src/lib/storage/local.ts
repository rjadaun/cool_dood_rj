import { promises as fs } from "node:fs";
import path from "node:path";
import type { PutObjectInput, PutObjectResult, StorageProvider } from "./types";

/**
 * Local disk provider. Files are written under `./storage` and served
 * back through the `/api/files/[...key]` route handler. Works out of the
 * box in development; swap `STORAGE_PROVIDER=s3` for production.
 */
export class LocalStorageProvider implements StorageProvider {
  private root = path.join(process.cwd(), "storage");

  publicUrl(key: string): string {
    return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
  }

  async put({ key, body }: PutObjectInput): Promise<PutObjectResult> {
    const filePath = path.join(this.root, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
    return { key, url: this.publicUrl(key) };
  }

  async remove(key: string): Promise<void> {
    const filePath = path.join(this.root, key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  /** Read a stored file (used by the file-serving route). */
  async read(key: string): Promise<Buffer> {
    const filePath = path.join(this.root, key);
    // Prevent path traversal outside the storage root.
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(this.root))) {
      throw new Error("Invalid key");
    }
    return fs.readFile(resolved);
  }
}
