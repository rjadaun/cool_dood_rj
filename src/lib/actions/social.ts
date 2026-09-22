"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { socialSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveSocial(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = socialSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    platform: d.platform,
    url: d.url,
    username: nn(d.username),
    visible: d.visible,
    sortOrder: d.sortOrder,
  };

  if (d.id) {
    await prisma.socialLink.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "SocialLink", entityId: d.id, summary: d.platform });
  } else {
    const count = await prisma.socialLink.count();
    const created = await prisma.socialLink.upsert({
      where: { platform: d.platform },
      create: { ...data, sortOrder: d.sortOrder || count },
      update: data,
    });
    await logActivity({ userId: user.id, action: "create", entity: "SocialLink", entityId: created.id, summary: d.platform });
  }

  revalidate([TAGS.social]);
  redirect("/admin/social");
}

export async function deleteSocial(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.socialLink.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "SocialLink", entityId: id });
    revalidate([TAGS.social]);
    return { ok: true, message: "Social link deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete social link." };
  }
}

export async function toggleSocialVisible(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const link = await prisma.socialLink.findUnique({ where: { id } });
    if (!link) return { ok: false, message: "Not found." };
    await prisma.socialLink.update({ where: { id }, data: { visible: !link.visible } });
    revalidate([TAGS.social]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update social link." };
  }
}

export async function reorderSocial(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.socialLink.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.social]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder social links." };
  }
}
