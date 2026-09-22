"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { pageSchema } from "@/lib/validation/schemas";
import { sanitizeHtml } from "@/lib/sanitize";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

function pathForSlug(slug: string): string {
  return slug === "home" ? "/" : `/${slug}`;
}

export async function savePage(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  // Checkbox inputs post "on" when checked and are absent otherwise — coerce to real booleans.
  const obj = formToObject(formData);
  obj.visible = formData.get("visible") === "on";

  const parsed = pageSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;
  if (!d.id) return { ok: false, message: "Missing page id." };

  const content = d.content && d.content.length ? sanitizeHtml(d.content) : null;

  await prisma.page.update({
    where: { id: d.id },
    data: {
      title: d.title,
      heading: nn(d.heading),
      subheading: nn(d.subheading),
      content,
      imageId: nn(d.imageId),
      seoTitle: nn(d.seoTitle),
      seoDescription: nn(d.seoDescription),
      visible: d.visible,
    },
  });
  await logActivity({ userId: user.id, action: "update", entity: "Page", entityId: d.id, summary: d.title });

  revalidate([TAGS.pages, TAGS.home], ["/", pathForSlug(d.slug)]);
  redirect("/admin/pages");
}

export async function savePageSection(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const obj = formToObject(formData);
  const id = typeof obj.id === "string" ? obj.id : "";
  if (!id) return { ok: false, message: "Missing section id." };

  const str = (v: unknown) => (typeof v === "string" && v.length ? v : null);

  await prisma.pageSection.update({
    where: { id },
    data: {
      heading: str(obj.heading),
      body: str(obj.body) ? sanitizeHtml(obj.body as string) : null,
      ctaText: str(obj.ctaText),
      ctaUrl: str(obj.ctaUrl),
      visible: obj.visible === "on" || obj.visible === "true",
    },
  });
  await logActivity({ userId: user.id, action: "update", entity: "PageSection", entityId: id });

  revalidate([TAGS.pages, TAGS.home]);
  return { ok: true, message: "Section saved." };
}

export async function addPageSection(pageId: string, key: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const count = await prisma.pageSection.count({ where: { pageId } });
    const created = await prisma.pageSection.create({
      data: { pageId, key: key && key.length ? key : `section-${count + 1}`, sortOrder: count },
    });
    await logActivity({ userId: user.id, action: "create", entity: "PageSection", entityId: created.id });
    revalidate([TAGS.pages, TAGS.home]);
    return { ok: true, message: "Section added." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not add section." };
  }
}

export async function deletePageSection(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.pageSection.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "PageSection", entityId: id });
    revalidate([TAGS.pages, TAGS.home]);
    return { ok: true, message: "Section deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete section." };
  }
}
