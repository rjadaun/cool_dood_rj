"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import type { FormResult } from "./helpers";

export async function deleteSubscriber(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const sub = await prisma.newsletterSubscriber.delete({ where: { id } });
    await logActivity({
      userId: user.id,
      action: "delete",
      entity: "NewsletterSubscriber",
      entityId: id,
      summary: sub.email,
    });
    revalidatePath("/admin/newsletter");
    return { ok: true, message: "Subscriber removed." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    return { ok: false, message: "Could not remove subscriber." };
  }
}

export async function toggleSubscriberActive(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) return { ok: false, message: "Subscriber not found." };
    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { active: !existing.active },
    });
    await logActivity({
      userId: user.id,
      action: "update",
      entity: "NewsletterSubscriber",
      entityId: id,
      summary: `${updated.email} → ${updated.active ? "active" : "inactive"}`,
    });
    revalidatePath("/admin/newsletter");
    return { ok: true, message: updated.active ? "Subscriber reactivated." : "Subscriber deactivated." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    return { ok: false, message: "Could not update subscriber." };
  }
}
