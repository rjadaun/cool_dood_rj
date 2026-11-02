"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { slugify } from "@/lib/utils";
import { portfolioSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, parseJsonField, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let slug = root;
  let n = 1;
  // Ensure uniqueness against other rows.
  while (true) {
    const existing = await prisma.portfolioProject.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

export async function savePortfolio(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const obj = formToObject(formData);
  obj.services = parseJsonField(obj.services, [] as string[]);
  obj.tags = parseJsonField(obj.tags, [] as string[]);
  obj.images = parseJsonField(obj.images, [] as unknown[]);
  obj.featured = formData.get("featured") === "on" || formData.get("featured") === "true";

  const parsed = portfolioSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;
  const year = typeof d.year === "number" ? d.year : null;
  const slug = d.slug ? slugify(d.slug) : "";

  const baseData = {
    title: d.title,
    description: nn(d.description),
    categoryId: nn(d.categoryId),
    clientId: nn(d.clientId),
    location: nn(d.location),
    year,
    coverId: nn(d.coverId),
    credits: nn(d.credits),
    services: d.services,
    tags: d.tags,
    galleryLayout: d.galleryLayout,
    featured: d.featured,
    status: d.status,
    seoTitle: nn(d.seoTitle),
    seoDescription: nn(d.seoDescription),
    ogImageId: nn(d.ogImageId),
    publishedAt: d.status === "PUBLISHED" ? new Date() : null,
  };

  const mediaIds = [...new Set(d.images.map((image) => image.mediaId))];
  if (mediaIds.length && await prisma.media.count({ where: { id: { in: mediaIds } } }) !== mediaIds.length) {
    return { ok: false, message: "Some gallery images no longer exist. Remove them and choose again." };
  }
  const gallery = d.images.map((img, i) => ({ mediaId: img.mediaId, sortOrder: i, caption: img.caption || null, altText: img.altText || null, focal: img.focal, aspect: img.aspect, visible: img.visible }));
  if (d.id) {
    const existing = await prisma.portfolioProject.findUnique({ where: { id: d.id } });
    if (!existing) return { ok: false, message: "Project not found." };
    const finalSlug = await uniqueSlug(slug || existing.slug || d.title, d.id);
    await prisma.portfolioProject.update({
      where: { id: d.id },
      data: { ...baseData, slug: finalSlug, publishedAt: existing.publishedAt ?? baseData.publishedAt, images: { deleteMany: {}, create: gallery } },
    });
    await logActivity({ userId: user.id, action: "update", entity: "PortfolioProject", entityId: d.id, summary: d.title });
  } else {
    const finalSlug = await uniqueSlug(slug || d.title);
    const created = await prisma.portfolioProject.create({ data: { ...baseData, slug: finalSlug, images: { create: gallery } } });
    await logActivity({ userId: user.id, action: "create", entity: "PortfolioProject", entityId: created.id, summary: d.title });
  }

  revalidate([TAGS.portfolio, TAGS.categories], ["/", "/portfolio"]);
  redirect("/admin/portfolio");
}

export async function deletePortfolio(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.portfolioProject.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "PortfolioProject", entityId: id });
    revalidate([TAGS.portfolio], ["/", "/portfolio"]);
    return { ok: true, message: "Project deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete project." };
  }
}

export async function togglePortfolioStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const project = await prisma.portfolioProject.findUnique({ where: { id } });
    if (!project) return { ok: false, message: "Not found." };
    const nextStatus = project.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await prisma.portfolioProject.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" && !project.publishedAt ? new Date() : project.publishedAt,
      },
    });
    revalidate([TAGS.portfolio], ["/", "/portfolio"]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update project." };
  }
}

export async function togglePortfolioFeatured(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const project = await prisma.portfolioProject.findUnique({ where: { id } });
    if (!project) return { ok: false, message: "Not found." };
    await prisma.portfolioProject.update({ where: { id }, data: { featured: !project.featured } });
    revalidate([TAGS.portfolio], ["/", "/portfolio"]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update project." };
  }
}

export async function duplicatePortfolio(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const project = await prisma.portfolioProject.findUnique({ where: { id }, include: { images: true } });
    if (!project) return { ok: false, message: "Not found." };
    const { id: _i, createdAt: _c, updatedAt: _u, images, slug, ...rest } = project;
    const newSlug = await uniqueSlug(`${project.title}-copy`);
    const created = await prisma.portfolioProject.create({
      data: {
        ...rest,
        title: `${project.title} (copy)`,
        slug: newSlug,
        status: "DRAFT",
        publishedAt: null,
        images: {
          create: images.map((img) => ({
            mediaId: img.mediaId,
            sortOrder: img.sortOrder,
            caption: img.caption,
            altText: img.altText,
            focal: img.focal,
            aspect: img.aspect,
            visible: img.visible,
          })),
        },
      },
    });
    await logActivity({ userId: user.id, action: "duplicate", entity: "PortfolioProject", entityId: created.id });
    revalidate([TAGS.portfolio]);
    return { ok: true, message: "Project duplicated." };
  } catch {
    return { ok: false, message: "Could not duplicate project." };
  }
}
