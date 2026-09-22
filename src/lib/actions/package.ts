"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { packageSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, parseJsonField, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function savePackage(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const obj = formToObject(formData);
  obj.features = parseJsonField(obj.features, [] as string[]);

  const parsed = packageSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    price: nn(d.price),
    priceSuffix: nn(d.priceSuffix),
    description: nn(d.description),
    ctaText: nn(d.ctaText),
    ctaUrl: nn(d.ctaUrl),
    featured: d.featured,
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    const id = d.id;
    await prisma.package.update({ where: { id }, data });
    await prisma.packageFeature.deleteMany({ where: { packageId: id } });
    if (d.features.length) {
      await prisma.packageFeature.createMany({
        data: d.features.map((label, i) => ({ packageId: id, label, sortOrder: i })),
      });
    }
    await logActivity({ userId: user.id, action: "update", entity: "Package", entityId: id, summary: d.name });
  } else {
    const count = await prisma.package.count();
    const created = await prisma.package.create({
      data: {
        ...data,
        sortOrder: d.sortOrder || count,
        features: { create: d.features.map((label, i) => ({ label, sortOrder: i })) },
      },
    });
    await logActivity({ userId: user.id, action: "create", entity: "Package", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.packages]);
  redirect("/admin/packages");
}

export async function deletePackage(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.package.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Package", entityId: id });
    revalidate([TAGS.packages]);
    return { ok: true, message: "Package deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete package." };
  }
}

export async function togglePackageStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) return { ok: false, message: "Not found." };
    await prisma.package.update({
      where: { id },
      data: { status: pkg.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.packages]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update package." };
  }
}

export async function reorderPackages(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.package.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.packages]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder packages." };
  }
}
