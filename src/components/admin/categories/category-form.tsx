"use client";

import type { Category, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { saveCategory } from "@/lib/actions/categories";

type CategoryWithCover = Category & { cover: Media | null };

export function CategoryForm({ category }: { category?: CategoryWithCover }) {
  return (
    <AdminForm action={saveCategory} cancelHref="/admin/categories" hiddenId={category?.id} submitLabel="Save category">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Name" htmlFor="name" required error={errors.name}>
                  <Input id="name" name="name" defaultValue={category?.name ?? ""} placeholder="Editorial" />
                </Field>
                <Field label="Slug" htmlFor="slug" hint="Leave empty to auto-generate from the name." error={errors.slug}>
                  <Input id="slug" name="slug" defaultValue={category?.slug ?? ""} placeholder="editorial" />
                </Field>
                <Field label="Description" htmlFor="description" error={errors.description}>
                  <Textarea id="description" name="description" defaultValue={category?.description ?? ""} rows={3} placeholder="Short description of this category." />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Cover image">
              <ImageField name="coverId" defaultValue={category?.cover ?? null} folder="categories" aspect="aspect-[3/2]" />
            </AdminCard>

            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={category?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={category?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
