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

  private resolveKey(key: string): string {
    const resolved = path.resolve(this.root, key);
    if (!resolved.startsWith(path.resolve(this.root) + path.sep)) throw new Error("Invalid key");
    return resolved;
  }

  publicUrl(key: string): string {
    return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
  }

  async put({ key, body }: PutObjectInput): Promise<PutObjectResult> {
    const filePath = this.resolveKey(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
    return { key, url: this.publicUrl(key) };
  }

  async remove(key: string): Promise<void> {
    const filePath = this.resolveKey(key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  /** Read a stored file (used by the file-serving route). */
  async read(key: string): Promise<Buffer> {
    const filePath = this.resolveKey(key);
    return fs.readFile(filePath);
  }
}
