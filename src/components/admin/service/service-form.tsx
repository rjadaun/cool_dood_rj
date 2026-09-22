"use client";

import type { Service, ServiceFeature, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { ArrayInput } from "@/components/admin/form/array-input";
import { saveService } from "@/lib/actions/service";

type ServiceWithRelations = Service & { image: Media | null; features: ServiceFeature[] };

export function ServiceForm({ service }: { service?: ServiceWithRelations }) {
  const featureLabels = service?.features
    ?.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => f.label) ?? [];

  return (
    <AdminForm action={saveService} cancelHref="/admin/services" hiddenId={service?.id} submitLabel="Save service">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Name" htmlFor="name" required error={errors.name}>
                  <Input id="name" name="name" defaultValue={service?.name ?? ""} placeholder="Brand Photography" />
                </Field>
                <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the name." error={errors.slug}>
                  <Input id="slug" name="slug" defaultValue={service?.slug ?? ""} placeholder="brand-photography" />
                </Field>
                <Field label="Short description" htmlFor="shortDescription" error={errors.shortDescription}>
                  <Textarea id="shortDescription" name="shortDescription" defaultValue={service?.shortDescription ?? ""} rows={2} placeholder="One-line summary shown in listings." />
                </Field>
                <Field label="Long description" htmlFor="longDescription" error={errors.longDescription}>
                  <Textarea id="longDescription" name="longDescription" defaultValue={service?.longDescription ?? ""} rows={4} placeholder="Full description shown on the service detail." />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Features">
              <ArrayInput name="features" defaultValue={featureLabels} variant="list" placeholder="Add a feature and press Enter" hint="Highlights shown as a checklist." />
            </AdminCard>

            <AdminCard title="Call to action">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="CTA text" htmlFor="ctaText" error={errors.ctaText}>
                  <Input id="ctaText" name="ctaText" defaultValue={service?.ctaText ?? ""} placeholder="Enquire" />
                </Field>
                <Field label="CTA URL" htmlFor="ctaUrl" error={errors.ctaUrl}>
                  <Input id="ctaUrl" name="ctaUrl" defaultValue={service?.ctaUrl ?? ""} placeholder="/contact" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Image">
              <ImageField name="imageId" defaultValue={service?.image ?? null} folder="services" aspect="aspect-[3/2]" />
            </AdminCard>

            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Number" htmlFor="number" hint="Editorial index, e.g. 01." error={errors.number}>
                  <Input id="number" name="number" defaultValue={service?.number ?? ""} placeholder="01" />
                </Field>
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={service?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={service?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
