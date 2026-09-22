"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import type { InquiryStatus } from "@prisma/client";
import type { FormResult } from "./helpers";

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.inquiry.update({ where: { id }, data: { status } });
    await logActivity({
      userId: user.id,
      action: "update",
      entity: "Inquiry",
      entityId: id,
      summary: `Status → ${status}`,
    });
    revalidatePath("/admin/inquiries");
    return { ok: true, message: `Marked ${status.toLowerCase()}.` };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    return { ok: false, message: "Could not update inquiry." };
  }
}

export async function deleteInquiry(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.inquiry.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Inquiry", entityId: id });
    revalidatePath("/admin/inquiries");
    return { ok: true, message: "Inquiry deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    return { ok: false, message: "Could not delete inquiry." };
  }
}
