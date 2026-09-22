"use client";

import type { Package, PackageFeature } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { ArrayInput } from "@/components/admin/form/array-input";
import { savePackage } from "@/lib/actions/package";

type PackageWithRelations = Package & { features: PackageFeature[] };

export function PackageForm({ pkg }: { pkg?: PackageWithRelations }) {
  const featureLabels = pkg?.features
    ?.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => f.label) ?? [];

  return (
    <AdminForm action={savePackage} cancelHref="/admin/packages" hiddenId={pkg?.id} submitLabel="Save package">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Name" htmlFor="name" required error={errors.name}>
                  <Input id="name" name="name" defaultValue={pkg?.name ?? ""} placeholder="Signature Session" />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Price" htmlFor="price" hint='Free text, e.g. "From $1,200".' error={errors.price}>
                    <Input id="price" name="price" defaultValue={pkg?.price ?? ""} placeholder="From $1,200" />
                  </Field>
                  <Field label="Price suffix" htmlFor="priceSuffix" hint='e.g. "/ day".' error={errors.priceSuffix}>
                    <Input id="priceSuffix" name="priceSuffix" defaultValue={pkg?.priceSuffix ?? ""} placeholder="/ day" />
                  </Field>
                </div>
                <Field label="Description" htmlFor="description" error={errors.description}>
                  <Textarea id="description" name="description" defaultValue={pkg?.description ?? ""} rows={3} placeholder="What's included at a glance." />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Features">
              <ArrayInput name="features" defaultValue={featureLabels} variant="list" placeholder="Add a feature and press Enter" hint="Line items shown in the package card." />
            </AdminCard>

            <AdminCard title="Call to action">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="CTA text" htmlFor="ctaText" error={errors.ctaText}>
                  <Input id="ctaText" name="ctaText" defaultValue={pkg?.ctaText ?? ""} placeholder="Book now" />
                </Field>
                <Field label="CTA URL" htmlFor="ctaUrl" error={errors.ctaUrl}>
                  <Input id="ctaUrl" name="ctaUrl" defaultValue={pkg?.ctaUrl ?? ""} placeholder="/contact" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Checkbox id="featured" name="featured" value="true" defaultChecked={pkg?.featured ?? false} label="Featured package" />
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={pkg?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={pkg?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
