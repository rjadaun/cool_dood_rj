export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface PutObjectResult {
  key: string;
  url: string;
}

export interface StorageProvider {
  /** Persist an object and return its public URL. */
  put(input: PutObjectInput): Promise<PutObjectResult>;
  /** Remove an object. Must not throw if the object is already gone. */
  remove(key: string): Promise<void>;
  /** Public URL for a stored key. */
  publicUrl(key: string): string;
}
