"use client";

import * as React from "react";
import type { BlogPost, Media } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { ArrayInput } from "@/components/admin/form/array-input";
import { RichText } from "@/components/admin/form/rich-text";
import { slugify } from "@/lib/utils";
import { saveBlogPost } from "@/lib/actions/blog";

type Post = BlogPost & { cover: Media | null };

export function JournalForm({ post }: { post?: Post }) {
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [slug, setSlug] = React.useState(post?.slug ?? "");

  return (
    <AdminForm action={saveBlogPost} cancelHref="/admin/journal" hiddenId={post?.id} submitLabel="Save post">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="space-y-4">
                <Field label="Title" htmlFor="title" required error={errors.title}>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={post?.title ?? ""}
                    placeholder="A refined perspective on editorial photography"
                    onChange={(e) => {
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                </Field>
                <Field label="Slug" htmlFor="slug" hint="Auto-generated from the title. Edit to override." error={errors.slug}>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="a-refined-perspective"
                  />
                </Field>
                <Field label="Excerpt" htmlFor="excerpt" hint="Short summary shown in listings." error={errors.excerpt}>
                  <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} rows={3} placeholder="A one or two sentence teaser." />
                </Field>
                <RichText name="content" defaultValue={post?.content ?? ""} error={errors.content} />
              </div>
            </AdminCard>

            <AdminCard title="SEO">
              <div className="space-y-4">
                <Field label="SEO title" htmlFor="seoTitle" error={errors.seoTitle}>
                  <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} placeholder="Overrides the post title in search results." />
                </Field>
                <Field label="SEO description" htmlFor="seoDescription" error={errors.seoDescription}>
                  <Textarea id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} rows={2} placeholder="Meta description for search engines." />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Cover image">
              <ImageField name="coverId" defaultValue={post?.cover ?? null} folder="journal" aspect="aspect-[3/2]" />
            </AdminCard>

            <AdminCard title="Details">
              <div className="space-y-4">
                <Field label="Category" htmlFor="category" error={errors.category}>
                  <Input id="category" name="category" defaultValue={post?.category ?? ""} placeholder="Editorial" />
                </Field>
                <ArrayInput
                  name="tags"
                  label="Tags"
                  variant="tags"
                  defaultValue={post?.tags ?? []}
                  placeholder="Add tag and press Enter"
                />
                <Field label="Author" htmlFor="author" error={errors.author}>
                  <Input id="author" name="author" defaultValue={post?.author ?? ""} placeholder="Jane Doe" />
                </Field>
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={post?.status ?? "DRAFT"}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
