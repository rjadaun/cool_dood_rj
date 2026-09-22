"use client";

import type { Page, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/field";
import { RichText } from "@/components/admin/form/rich-text";
import { ImageField } from "@/components/admin/media/image-field";
import { savePage } from "@/lib/actions/pages";

export function PageForm({ page }: { page: Page & { image: Media | null } }) {
  return (
    <AdminForm action={savePage} cancelHref="/admin/pages" hiddenId={page.id} submitLabel="Save page">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <input type="hidden" name="slug" value={page.slug} />
          <input type="hidden" name="title" value={page.title} />

          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Header">
              <div className="space-y-4">
                <Field label="Heading" htmlFor="heading" hint="The main headline shown on the page." error={errors.heading}>
                  <Input id="heading" name="heading" defaultValue={page.heading ?? ""} placeholder="About the studio" />
                </Field>
                <Field label="Subheading" htmlFor="subheading" error={errors.subheading}>
                  <Textarea id="subheading" name="subheading" defaultValue={page.subheading ?? ""} rows={2} placeholder="A short supporting line under the heading." />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Body content">
              <RichText name="content" label="Content" defaultValue={page.content ?? ""} error={errors.content} />
            </AdminCard>

            <AdminCard title="SEO">
              <div className="space-y-4">
                <Field label="SEO title" htmlFor="seoTitle" error={errors.seoTitle}>
                  <Input id="seoTitle" name="seoTitle" defaultValue={page.seoTitle ?? ""} placeholder="Overrides the page title in search results." />
                </Field>
                <Field label="SEO description" htmlFor="seoDescription" error={errors.seoDescription}>
                  <Textarea id="seoDescription" name="seoDescription" defaultValue={page.seoDescription ?? ""} rows={2} placeholder="Meta description for search engines." />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Feature image">
              <ImageField
                name="imageId"
                defaultValue={page.image}
                folder="pages"
                aspect="aspect-[4/5]"
              />
              <p className="mt-3 text-xs text-stone-500">
                {page.slug === "home"
                  ? "Shown beside the introduction section on the homepage."
                  : "Optional image shown on this page."}
              </p>
            </AdminCard>

            <AdminCard title="Visibility">
              <div className="space-y-3">
                <Checkbox id="visible" name="visible" defaultChecked={page.visible} label="Visible on the site" />
                <p className="text-xs text-stone-500">
                  Slug: <span className="font-mono">/{page.slug}</span>
                </p>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
