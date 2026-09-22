"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  // Log the successful login (best effort).
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  await logActivity({
    userId: user?.id,
    action: "login",
    entity: "User",
    entityId: user?.id,
    ipAddress: getClientIp(await headers()),
    summary: `${email} signed in`,
  });

  redirect(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
