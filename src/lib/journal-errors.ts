import { randomUUID } from "node:crypto";
import type { FormResult } from "@/lib/actions/helpers";

/** Expected persistence failures should keep the editor open, not crash the page. */
export function journalSaveFailure(error: unknown): FormResult {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : undefined;
  if (code === "P2002") {
    return { ok: false, message: "This URL slug is already used. Choose a different slug.", fieldErrors: { slug: "Choose a unique slug." } };
  }
  if (code === "P2025") {
    return { ok: false, message: "The post or selected cover image no longer exists. Refresh the journal list before trying again." };
  }
  const reference = randomUUID().slice(0, 8);
  console.error("[journal save]", { reference, code, error });
  return {
    ok: false,
    message: `The post could not be saved. Your form is still open. Please try again; if this continues, share reference ${reference}.`,
  };
}
