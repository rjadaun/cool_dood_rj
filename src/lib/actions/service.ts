"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { serviceSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";
import { formToObject, fieldErrorsFromZod, parseJsonField, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveService(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const obj = formToObject(formData);
  obj.features = parseJsonField(obj.features, [] as string[]);

  const parsed = serviceSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    slug: d.slug && d.slug.length ? d.slug : slugify(d.name),
    shortDescription: nn(d.shortDescription),
    longDescription: nn(d.longDescription),
    imageId: nn(d.imageId),
    number: nn(d.number),
    ctaText: nn(d.ctaText),
    ctaUrl: nn(d.ctaUrl),
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    const id = d.id;
    await prisma.service.update({ where: { id }, data });
    await prisma.serviceFeature.deleteMany({ where: { serviceId: id } });
    if (d.features.length) {
      await prisma.serviceFeature.createMany({
        data: d.features.map((label, i) => ({ serviceId: id, label, sortOrder: i })),
      });
    }
    await logActivity({ userId: user.id, action: "update", entity: "Service", entityId: id, summary: d.name });
  } else {
    const count = await prisma.service.count();
    const created = await prisma.service.create({
      data: {
        ...data,
        sortOrder: d.sortOrder || count,
        features: { create: d.features.map((label, i) => ({ label, sortOrder: i })) },
      },
    });
    await logActivity({ userId: user.id, action: "create", entity: "Service", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.services]);
  redirect("/admin/services");
}

export async function deleteService(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.service.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Service", entityId: id });
    revalidate([TAGS.services]);
    return { ok: true, message: "Service deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete service." };
  }
}

export async function toggleServiceStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return { ok: false, message: "Not found." };
    await prisma.service.update({
      where: { id },
      data: { status: service.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.services]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update service." };
  }
}

export async function reorderServices(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.service.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.services]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder services." };
  }
}
