"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { heroSlideSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveHeroSlide(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = heroSlideSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    label: nn(d.label),
    title: d.title,
    subtitle: nn(d.subtitle),
    description: nn(d.description),
    ctaText: nn(d.ctaText),
    ctaUrl: nn(d.ctaUrl),
    ctaSecondary: nn(d.ctaSecondary),
    ctaSecondaryUrl: nn(d.ctaSecondaryUrl),
    imageId: nn(d.imageId),
    overlay: d.overlay,
    focal: d.focal,
    transition: d.transition,
    durationMs: d.durationMs,
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.heroSlide.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "HeroSlide", entityId: d.id, summary: d.title });
  } else {
    const count = await prisma.heroSlide.count();
    const created = await prisma.heroSlide.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "HeroSlide", entityId: created.id, summary: d.title });
  }

  revalidate([TAGS.hero]);
  redirect("/admin/hero");
}

export async function deleteHeroSlide(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.heroSlide.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "HeroSlide", entityId: id });
    revalidate([TAGS.hero]);
    return { ok: true, message: "Slide deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete slide." };
  }
}

export async function toggleHeroStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) return { ok: false, message: "Not found." };
    await prisma.heroSlide.update({
      where: { id },
      data: { status: slide.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.hero]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update slide." };
  }
}

export async function duplicateHeroSlide(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) return { ok: false, message: "Not found." };
    const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = slide;
    const created = await prisma.heroSlide.create({
      data: { ...rest, title: `${slide.title} (copy)`, status: "DRAFT", sortOrder: slide.sortOrder + 1 },
    });
    await logActivity({ userId: user.id, action: "duplicate", entity: "HeroSlide", entityId: created.id });
    revalidate([TAGS.hero]);
    return { ok: true, message: "Slide duplicated." };
  } catch {
    return { ok: false, message: "Could not duplicate slide." };
  }
}

export async function reorderHeroSlides(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.heroSlide.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.hero]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder slides." };
  }
}
