"use client";

import type { HeroSlide, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { saveHeroSlide } from "@/lib/actions/hero";

type Slide = HeroSlide & { image: Media | null };

export function HeroForm({ slide }: { slide?: Slide }) {
  return (
    <AdminForm action={saveHeroSlide} cancelHref="/admin/hero" hiddenId={slide?.id} submitLabel="Save slide">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Category label" htmlFor="label" hint="Small overline, e.g. FASHION / EDITORIAL" error={errors.label}>
                  <Input id="label" name="label" defaultValue={slide?.label ?? ""} placeholder="Fashion / Editorial" />
                </Field>
                <Field label="Title" htmlFor="title" required error={errors.title}>
                  <Textarea id="title" name="title" defaultValue={slide?.title ?? ""} rows={2} placeholder="Visual stories with a refined perspective." />
                </Field>
                <Field label="Description" htmlFor="description" error={errors.description}>
                  <Textarea id="description" name="description" defaultValue={slide?.description ?? ""} rows={2} placeholder="Short informative line under the title." />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Call to action">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Primary CTA text" htmlFor="ctaText" error={errors.ctaText}>
                  <Input id="ctaText" name="ctaText" defaultValue={slide?.ctaText ?? ""} placeholder="View Portfolio" />
                </Field>
                <Field label="Primary CTA URL" htmlFor="ctaUrl" error={errors.ctaUrl}>
                  <Input id="ctaUrl" name="ctaUrl" defaultValue={slide?.ctaUrl ?? ""} placeholder="/portfolio" />
                </Field>
                <Field label="Secondary CTA text" htmlFor="ctaSecondary" error={errors.ctaSecondary}>
                  <Input id="ctaSecondary" name="ctaSecondary" defaultValue={slide?.ctaSecondary ?? ""} placeholder="Work With Me" />
                </Field>
                <Field label="Secondary CTA URL" htmlFor="ctaSecondaryUrl" error={errors.ctaSecondaryUrl}>
                  <Input id="ctaSecondaryUrl" name="ctaSecondaryUrl" defaultValue={slide?.ctaSecondaryUrl ?? ""} placeholder="/contact" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Image">
              <ImageField name="imageId" defaultValue={slide?.image ?? null} folder="hero" aspect="aspect-[3/2]" />
              <div className="mt-4">
                <Field label="Focal position" htmlFor="focal">
                  <Select id="focal" name="focal" defaultValue={slide?.focal ?? "CENTER"}>
                    {["CENTER", "TOP", "BOTTOM", "LEFT", "RIGHT", "TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"].map((f) => (
                      <option key={f} value={f}>{f.replace("_", " ").toLowerCase()}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Transition" htmlFor="transition">
                  <Select id="transition" name="transition" defaultValue={slide?.transition ?? "KEN_BURNS"}>
                    <option value="KEN_BURNS">Ken Burns</option>
                    <option value="SLOW_ZOOM">Slow zoom</option>
                    <option value="CROSSFADE">Crossfade</option>
                    <option value="FADE">Fade</option>
                  </Select>
                </Field>
                <Field label="Overlay darkness (%)" htmlFor="overlay" hint="Higher = darker, for text legibility.">
                  <Input id="overlay" name="overlay" type="number" min={0} max={100} defaultValue={slide?.overlay ?? 45} />
                </Field>
                <Field label="Duration (ms)" htmlFor="durationMs" hint="How long the slide is shown.">
                  <Input id="durationMs" name="durationMs" type="number" min={2000} max={15000} step={500} defaultValue={slide?.durationMs ?? 6000} />
                </Field>
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={slide?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={slide?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
