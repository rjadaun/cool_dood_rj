"use client";

import type { Client, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { saveClient } from "@/lib/actions/clients";

type ClientWithLogos = Client & { logo: Media | null; logoDark: Media | null };

export function ClientForm({ client }: { client?: ClientWithLogos }) {
  return (
    <AdminForm action={saveClient} cancelHref="/admin/clients" hiddenId={client?.id} submitLabel="Save client">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Details">
              <div className="space-y-4">
                <Field label="Name" htmlFor="name" required error={errors.name}>
                  <Input id="name" name="name" defaultValue={client?.name ?? ""} placeholder="Acme Inc." />
                </Field>
                <Field label="Website" htmlFor="website" error={errors.website}>
                  <Input id="website" name="website" defaultValue={client?.website ?? ""} placeholder="https://example.com" />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Logos">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageField name="logoId" label="Logo (light background)" defaultValue={client?.logo ?? null} folder="clients" aspect="aspect-[3/2]" />
                <ImageField name="logoDarkId" label="Logo (dark background)" defaultValue={client?.logoDark ?? null} folder="clients" aspect="aspect-[3/2]" />
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={client?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={client?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
