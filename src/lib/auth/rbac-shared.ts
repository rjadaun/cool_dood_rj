export type RoleName = "EDITOR" | "ADMIN" | "SUPER_ADMIN";

/** Ordered from least to most privileged. */
export const HIERARCHY: Record<RoleName, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/** Pure role check — safe to import from client components. */
export function hasRole(role: string | undefined, min: RoleName): boolean {
  if (!role) return false;
  const current = HIERARCHY[role as RoleName];
  return current !== undefined && current >= HIERARCHY[min];
}

export const ADMIN_ONLY_SECTIONS = ["settings", "users", "activity", "seo"] as const;
