"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { awardSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveAward(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = awardSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    year: typeof d.year === "number" ? d.year : null,
    description: nn(d.description),
    logoId: nn(d.logoId),
    link: nn(d.link),
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.award.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "Award", entityId: d.id, summary: d.name });
  } else {
    const count = await prisma.award.count();
    const created = await prisma.award.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "Award", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.awards]);
  redirect("/admin/awards");
}

export async function deleteAward(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.award.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Award", entityId: id });
    revalidate([TAGS.awards]);
    return { ok: true, message: "Award deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete award." };
  }
}

export async function toggleAwardStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const award = await prisma.award.findUnique({ where: { id } });
    if (!award) return { ok: false, message: "Not found." };
    await prisma.award.update({
      where: { id },
      data: { status: award.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.awards]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update award." };
  }
}

export async function reorderAwards(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.award.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.awards]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder awards." };
  }
}
