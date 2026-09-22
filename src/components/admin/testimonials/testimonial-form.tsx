"use client";

import type { Testimonial, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { saveTestimonial } from "@/lib/actions/testimonials";

type TestimonialWithImage = Testimonial & { image: Media | null };

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialWithImage }) {
  return (
    <AdminForm action={saveTestimonial} cancelHref="/admin/testimonials" hiddenId={testimonial?.id} submitLabel="Save testimonial">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Quote" htmlFor="quote" required error={errors.quote}>
                  <Textarea id="quote" name="quote" defaultValue={testimonial?.quote ?? ""} rows={4} placeholder="Working with the team was an absolute pleasure…" />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" htmlFor="name" required error={errors.name}>
                    <Input id="name" name="name" defaultValue={testimonial?.name ?? ""} placeholder="Jane Doe" />
                  </Field>
                  <Field label="Company" htmlFor="company" error={errors.company}>
                    <Input id="company" name="company" defaultValue={testimonial?.company ?? ""} placeholder="Acme Inc." />
                  </Field>
                  <Field label="Role" htmlFor="role" error={errors.role}>
                    <Input id="role" name="role" defaultValue={testimonial?.role ?? ""} placeholder="Creative Director" />
                  </Field>
                  <Field label="Rating (1-5)" htmlFor="rating" error={errors.rating}>
                    <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? ""} />
                  </Field>
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Image">
              <ImageField name="imageId" defaultValue={testimonial?.image ?? null} folder="testimonials" aspect="aspect-square" />
            </AdminCard>

            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Checkbox id="featured" name="featured" value="true" defaultChecked={testimonial?.featured ?? false} label="Featured testimonial" />
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={testimonial?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={testimonial?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
