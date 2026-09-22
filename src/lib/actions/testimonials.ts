"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/rbac";
import { logActivity } from "@/lib/activity";
import { TAGS } from "@/lib/cache-tags";
import { testimonialSchema } from "@/lib/validation/schemas";
import { formToObject, fieldErrorsFromZod, revalidate, type FormResult } from "./helpers";

const nn = (v: string | undefined | null) => (v && v.length ? v : null);

export async function saveTestimonial(_prev: FormResult, formData: FormData): Promise<FormResult> {
  let user;
  try {
    user = await requireUser("EDITOR");
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "You don't have permission to do that." };
    throw e;
  }

  const parsed = testimonialSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    company: nn(d.company),
    role: nn(d.role),
    quote: d.quote,
    rating: typeof d.rating === "number" ? d.rating : null,
    imageId: nn(d.imageId),
    featured: d.featured,
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (d.id) {
    await prisma.testimonial.update({ where: { id: d.id }, data });
    await logActivity({ userId: user.id, action: "update", entity: "Testimonial", entityId: d.id, summary: d.name });
  } else {
    const count = await prisma.testimonial.count();
    const created = await prisma.testimonial.create({ data: { ...data, sortOrder: d.sortOrder || count } });
    await logActivity({ userId: user.id, action: "create", entity: "Testimonial", entityId: created.id, summary: d.name });
  }

  revalidate([TAGS.testimonials]);
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    await prisma.testimonial.delete({ where: { id } });
    await logActivity({ userId: user.id, action: "delete", entity: "Testimonial", entityId: id });
    revalidate([TAGS.testimonials]);
    return { ok: true, message: "Testimonial deleted." };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, message: "Permission denied." };
    return { ok: false, message: "Could not delete testimonial." };
  }
}

export async function toggleTestimonialStatus(id: string): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) return { ok: false, message: "Not found." };
    await prisma.testimonial.update({
      where: { id },
      data: { status: testimonial.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidate([TAGS.testimonials]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update testimonial." };
  }
}

export async function duplicateTestimonial(id: string): Promise<FormResult> {
  try {
    const user = await requireUser("EDITOR");
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) return { ok: false, message: "Not found." };
    const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = testimonial;
    const created = await prisma.testimonial.create({
      data: { ...rest, name: `${testimonial.name} (copy)`, status: "DRAFT", sortOrder: testimonial.sortOrder + 1 },
    });
    await logActivity({ userId: user.id, action: "duplicate", entity: "Testimonial", entityId: created.id });
    revalidate([TAGS.testimonials]);
    return { ok: true, message: "Testimonial duplicated." };
  } catch {
    return { ok: false, message: "Could not duplicate testimonial." };
  }
}

export async function reorderTestimonials(ids: string[]): Promise<FormResult> {
  try {
    await requireUser("EDITOR");
    await prisma.$transaction(
      ids.map((id, index) => prisma.testimonial.update({ where: { id }, data: { sortOrder: index } }))
    );
    revalidate([TAGS.testimonials]);
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not reorder testimonials." };
  }
}
