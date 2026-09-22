"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { categorySchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveCategory(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    slug: d.slug && d.slug.length ? slugify(d.slug) : slugify(d.name),
    description: nn(d.description),
    coverId: nn(d.coverId),
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.category.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "Category", entityId: d.id, summary: d.name });
  } else {
    const count = await prisma.category.count();
    const created = await prisma.category.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "Category", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.categories, TAGS.portfolio]);
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.category.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Category", entityId: id });
    revalidate([TAGS.categories, TAGS.portfolio]);
    return { ok: true, message: "Category deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete category." };
  }
}

export async function toggleCategoryStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { ok: false, message: "Not found." };
    await prisma.category.update({
      where: { id },
      data: { status: category.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.categories, TAGS.portfolio]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update category." };
  }
}

export async function reorderCategories(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.categories, TAGS.portfolio]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder categories." };
  }
}
