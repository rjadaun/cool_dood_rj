"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { blogSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { formToObject, fieldErrorsFromZod, parseJsonField, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveBlogPost(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const obj = formToObject(formData);
  obj.tags = parseJsonField(obj.tags, [] as string[]);

  const parsed = blogSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const content = d.content && d.content.length ? sanitizeHtml(d.content) : null;

  const data = {
    title: d.title,
    slug: d.slug && d.slug.length ? slugify(d.slug) : slugify(d.title),
    excerpt: nn(d.excerpt),
    content,
    coverId: nn(d.coverId),
    category: nn(d.category),
    tags: d.tags,
    author: nn(d.author),
    status: d.status,
    seoTitle: nn(d.seoTitle),
    seoDescription: nn(d.seoDescription),
  };

  if (d.id) {
    const id = d.id;
    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
    const publishedAt =
      d.status === "PUBLISHED" && !existing?.publishedAt ? new Date() : existing?.publishedAt ?? null;
    await prisma.blogPost.update({ where: { id }, data: { ...data, publishedAt } });
    await logActivity({ userId: user.id, action: "update", entity: "BlogPost", entityId: id, summary: d.title });
  } else {
    const publishedAt = d.status === "PUBLISHED" ? new Date() : null;
    const created = await prisma.blogPost.create({ data: { ...data, publishedAt } });
    await logActivity({ userId: user.id, action: "create", entity: "BlogPost", entityId: created.id, summary: d.title });
  }

  revalidate([TAGS.blog]);
  redirect("/admin/journal");
}

export async function deleteBlogPost(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.blogPost.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "BlogPost", entityId: id });
    revalidate([TAGS.blog]);
    return { ok: true, message: "Post deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete post." };
  }
}

export async function toggleBlogStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return { ok: false, message: "Not found." };
    const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const publishedAt = nextStatus === "PUBLISHED" && !post.publishedAt ? new Date() : post.publishedAt;
    await prisma.blogPost.update({ where: { id }, data: { status: nextStatus, publishedAt } });
    revalidate([TAGS.blog]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update post." };
  }
}
