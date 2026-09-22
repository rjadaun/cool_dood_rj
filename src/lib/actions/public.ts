"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { contactSchema, newsletterSchema } from "@/lib/validation/schemas";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { adminInquiryEmail, clientInquiryConfirmation } from "@/lib/email/templates";
import { getSettings } from "@/lib/queries/settings";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

function zodErrors(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function submitInquiry(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  if (!rateLimit(`inquiry:${ip}`, 4, 60_000).success) {
    return { ok: false, message: "Too many submissions. Please try again in a minute." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors: zodErrors(parsed.error) };
  }

  const data = parsed.data;
  // Honeypot triggered → pretend success, drop silently.
  if (data.company_url) return { ok: true, message: "Thank you, your inquiry has been received." };

  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      projectType: data.projectType || null,
      budget: data.budget || null,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      location: data.location || null,
      message: data.message,
      website: data.website || null,
      referral: data.referral || null,
      ipAddress: ip,
    },
  });

  const settings = await getSettings();
  const adminMail = adminInquiryEmail(inquiry);
  await sendEmail({
    to: settings.contactEmail || settings.email || "hello@lumiere.studio",
    subject: adminMail.subject,
    html: adminMail.html,
    replyTo: inquiry.email,
  });
  const confirm = clientInquiryConfirmation(inquiry);
  await sendEmail({ to: inquiry.email, subject: confirm.subject, html: confirm.html });

  return { ok: true, message: "Thank you, your inquiry has been received. We'll be in touch shortly." };
}

export async function subscribeNewsletter(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  if (!rateLimit(`newsletter:${ip}`, 6, 60_000).success) {
    return { ok: false, message: "Please slow down and try again shortly." };
  }

  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email.", fieldErrors: zodErrors(parsed.error) };
  }
  if (parsed.data.website) return { ok: true, message: "You're subscribed." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.active) {
      await prisma.newsletterSubscriber.update({ where: { email }, data: { active: true } });
    }
    return { ok: true, message: "You're already on the list, thank you." };
  }

  await prisma.newsletterSubscriber.create({ data: { email, source: "website" } });
  return { ok: true, message: "You're subscribed. Welcome to the studio." };
}
