"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { statSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

export async function saveStat(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = statSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    value: d.value,
    label: d.label,
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.stat.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "Stat", entityId: d.id, summary: d.label });
  } else {
    const count = await prisma.stat.count();
    const created = await prisma.stat.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "Stat", entityId: created.id, summary: d.label });
  }

  revalidate([TAGS.stats]);
  redirect("/admin/stats");
}

export async function deleteStat(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.stat.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Stat", entityId: id });
    revalidate([TAGS.stats]);
    return { ok: true, message: "Stat deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete stat." };
  }
}

export async function toggleStatStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const stat = await prisma.stat.findUnique({ where: { id } });
    if (!stat) return { ok: false, message: "Not found." };
    await prisma.stat.update({
      where: { id },
      data: { status: stat.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.stats]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update stat." };
  }
}

export async function reorderStats(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.stat.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.stats]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder stats." };
  }
}
