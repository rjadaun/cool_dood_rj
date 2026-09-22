import { revalidateTag, revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import type { CacheTag } from "@/lib/cache-tags";

export interface FormResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Convert FormData to a plain object; repeated keys become arrays. */
export function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    const values = formData.getAll(key).filter((v) => typeof v === "string") as string[];
    obj[key] = values.length > 1 ? values : values[0];
  }
  return obj;
}

/** Parse a JSON array field posted from the client (e.g. features, images). */
export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Revalidate affected public cache tags plus admin + public paths. */
export function revalidate(tags: CacheTag[], paths: string[] = ["/"]) {
  for (const tag of tags) revalidateTag(tag);
  for (const path of paths) revalidatePath(path);
}
