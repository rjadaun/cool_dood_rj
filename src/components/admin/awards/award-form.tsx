"use client";

import type { Award, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { saveAward } from "@/lib/actions/awards";

type AwardWithLogo = Award & { logo: Media | null };

export function AwardForm({ award }: { award?: AwardWithLogo }) {
  return (
    <AdminForm action={saveAward} cancelHref="/admin/awards" hiddenId={award?.id} submitLabel="Save award">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" htmlFor="name" required error={errors.name}>
                    <Input id="name" name="name" defaultValue={award?.name ?? ""} placeholder="Photographer of the Year" />
                  </Field>
                  <Field label="Year" htmlFor="year" error={errors.year}>
                    <Input id="year" name="year" type="number" min={1900} max={2100} defaultValue={award?.year ?? ""} placeholder="2025" />
                  </Field>
                </div>
                <Field label="Description" htmlFor="description" error={errors.description}>
                  <Textarea id="description" name="description" defaultValue={award?.description ?? ""} rows={3} placeholder="Awarded by…" />
                </Field>
                <Field label="Link" htmlFor="link" error={errors.link}>
                  <Input id="link" name="link" defaultValue={award?.link ?? ""} placeholder="https://example.com" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Logo">
              <ImageField name="logoId" defaultValue={award?.logo ?? null} folder="awards" aspect="aspect-[3/2]" />
            </AdminCard>

            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={award?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={award?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
