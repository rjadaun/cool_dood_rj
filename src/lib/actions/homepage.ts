"use server";

import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { revalidate, type FormResult } from "./helpers";

export async function reorderHomeSections(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.homeSection.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.home]);
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not reorder sections." };
  }
}

export async function toggleHomeSection(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const section = await prisma.homeSection.findUnique({ where: { id } });
    if (!section) return { ok: false, message: "Not found." };
    await prisma.homeSection.update({ where: { id }, data: { visible: !section.visible } });
    await logActivity({ userId: user.id, action: "update", entity: "HomeSection", entityId: id, summary: section.label });
    revalidate([TAGS.home]);
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not update section." };
  }
}
