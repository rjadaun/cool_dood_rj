import { env } from "@/lib/env";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import { CloudinaryStorageProvider } from "./cloudinary";
import type { StorageProvider } from "./types";

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (instance) return instance;
  switch (env.storage.provider) {
    case "s3":
      instance = new S3StorageProvider();
      break;
    case "cloudinary":
      instance = new CloudinaryStorageProvider();
      break;
    default:
      instance = new LocalStorageProvider();
  }
  return instance;
}

export { LocalStorageProvider };
export type { StorageProvider } from "./types";
