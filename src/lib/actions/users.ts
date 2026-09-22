"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { hashPassword } from "@/lib/auth/password";
import { userSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, type FormResult } from "./helpers";

/** Count of users who are active SUPER_ADMINs. */
async function activeSuperAdminCount(): Promise<number> {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", status: "ACTIVE" } });
}

export async function saveUser(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let admin;
  try {
    admin = await requireUser("ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = userSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;
  const password = d.password && d.password.length ? d.password : null;

  // Password is required when creating a new user.
  if (!d.id && !password) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: { password: "Password is required." } };
  }

  // Ensure email uniqueness (friendly error rather than a raw Prisma throw).
  const emailOwner = await prisma.user.findUnique({ where: { email: d.email }, select: { id: true } });
  if (emailOwner && emailOwner.id !== d.id) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: { email: "That email is already in use." } };
  }

  if (d.id) {
    const existing = await prisma.user.findUnique({ where: { id: d.id } });
    if (!existing) return { ok: false, message: "User not found." };

    // Guard: don't let the last active SUPER_ADMIN be demoted or disabled.
    const wasActiveSuper = existing.role === "SUPER_ADMIN" && existing.status === "ACTIVE";
    const staysActiveSuper = d.role === "SUPER_ADMIN" && d.status === "ACTIVE";
    if (wasActiveSuper && !staysActiveSuper && (await activeSuperAdminCount()) <= 1) {
      return { ok: false, message: "You can't disable or demote the last super admin." };
    }

    await prisma.user.update({
      where: { id: d.id },
      data: {
        name: d.name,
        email: d.email,
        role: d.role,
        status: d.status,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    await logActivity({ userId: admin.id, action: "update", entity: "User", entityId: d.id, summary: d.email });
  } else {
    const created = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        role: d.role,
        status: d.status,
        passwordHash: await hashPassword(password as string),
      },
    });
    await logActivity({ userId: admin.id, action: "create", entity: "User", entityId: created.id, summary: d.email });
  }

  redirect("/admin/users");
}

export async function deleteUser(id: string): Promise<FormResult> {
  try {
    const admin = await requireUser("ADMIN");

    if (admin.id === id) {
      return { ok: false, message: "You can't delete your own account." };
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { ok: false, message: "User not found." };

    if (target.role === "SUPER_ADMIN" && target.status === "ACTIVE" && (await activeSuperAdminCount()) <= 1) {
      return { ok: false, message: "You can't delete the last super admin." };
    }

    await prisma.user.delete({ where: { id } });
    await logActivity({ userId: admin.id, action: "delete", entity: "User", entityId: id, summary: target.email });
    return { ok: true, message: "User deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete user." };
  }
}
