"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { clientSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveClient(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = clientSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    website: nn(d.website),
    logoId: nn(d.logoId),
    logoDarkId: nn(d.logoDarkId),
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.client.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "Client", entityId: d.id, summary: d.name });
  } else {
    const count = await prisma.client.count();
    const created = await prisma.client.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "Client", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.clients]);
  redirect("/admin/clients");
}

export async function deleteClient(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.client.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Client", entityId: id });
    revalidate([TAGS.clients]);
    return { ok: true, message: "Client deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete client." };
  }
}

export async function toggleClientStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return { ok: false, message: "Not found." };
    await prisma.client.update({
      where: { id },
      data: { status: client.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.clients]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update client." };
  }
}

export async function reorderClients(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.client.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.clients]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder clients." };
  }
}
