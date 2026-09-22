import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "./index";
import { hasRole, ADMIN_ONLY_SECTIONS } from "./rbac-shared";

export { hasRole, ADMIN_ONLY_SECTIONS };

export function canAccessSection(role: string | undefined, section: string): boolean {
  if (ADMIN_ONLY_SECTIONS.includes(section as (typeof ADMIN_ONLY_SECTIONS)[number])) {
    return hasRole(role, "ADMIN");
  }
  return hasRole(role, "EDITOR");
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthError";
  }
}

/**
 * Server-action / route-handler guard. Throws AuthError on failure.
 */
export async function requireUser(min: Role = "EDITOR") {
  const session = await auth();
  if (!session?.user) throw new AuthError("UNAUTHENTICATED");
  if (!hasRole(session.user.role, min)) throw new AuthError("FORBIDDEN");
  return session.user;
}

/**
 * Server-component guard. Redirects to login / dashboard instead of throwing.
 */
export async function requirePage(min: Role = "EDITOR") {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!hasRole(session.user.role, min)) redirect("/admin");
  return session.user;
}
