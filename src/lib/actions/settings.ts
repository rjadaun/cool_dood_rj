"use server";

import { redirect } from "next/navigation";
import { revalidateTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { SETTINGS_TAG } from "@/lib/queries/settings";
import { settingsSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveSettings(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  // Checkbox inputs post "on" when checked and are absent otherwise — coerce to real booleans.
  const obj = formToObject(formData);
  obj.maintenanceMode = formData.get("maintenanceMode") === "on";
  obj.showPricingPublic = formData.get("showPricingPublic") === "on";
  obj.newsletterEnabled = formData.get("newsletterEnabled") === "on";

  const parsed = settingsSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    siteName: d.siteName,
    tagline: nn(d.tagline),
    logoUrl: nn(d.logoUrl),
    faviconUrl: nn(d.faviconUrl),
    email: nn(d.email),
    phone: nn(d.phone),
    address: nn(d.address),
    defaultSeoTitle: nn(d.defaultSeoTitle),
    defaultSeoDesc: nn(d.defaultSeoDesc),
    ogImageUrl: nn(d.ogImageUrl),
    gaId: nn(d.gaId),
    contactEmail: nn(d.contactEmail),
    copyright: nn(d.copyright),
    timezone: d.timezone || "UTC",
    maintenanceMode: d.maintenanceMode,
    showPricingPublic: d.showPricingPublic,
    newsletterEnabled: d.newsletterEnabled,
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  await logActivity({ userId: user.id, action: "update", entity: "SiteSetting", entityId: "singleton", summary: "Settings updated" });

  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");

  redirect("/admin/settings");
}
