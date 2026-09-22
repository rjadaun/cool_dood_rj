"use client";

import type { Category, Client, Media, PortfolioImage, PortfolioProject } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/field";
import { ImageField } from "@/components/admin/media/image-field";
import { ArrayInput } from "@/components/admin/form/array-input";
import { GalleryEditor, type GalleryImage } from "./gallery-editor";
import { savePortfolio } from "@/lib/actions/portfolio";

type FullProject = PortfolioProject & {
  cover: Media | null;
  ogImage: Media | null;
  images: (PortfolioImage & { media: Media })[];
};

interface Props {
  project?: FullProject;
  categories: Pick<Category, "id" | "name">[];
  clients: Pick<Client, "id" | "name">[];
}

export function PortfolioForm({ project, categories, clients }: Props) {
  const defaultImages: GalleryImage[] = (project?.images ?? []).map((img, i) => ({
    key: `existing-${img.id ?? i}`,
    mediaId: img.mediaId,
    url: img.media.url,
    caption: img.caption ?? "",
    altText: img.altText ?? "",
    focal: img.focal,
    aspect: img.aspect,
    visible: img.visible,
  }));

  return (
    <AdminForm action={savePortfolio} cancelHref="/admin/portfolio" hiddenId={project?.id} submitLabel="Save project">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Project information">
              <div className="space-y-4">
                <Field label="Title" htmlFor="title" required error={errors.title}>
                  <Input id="title" name="title" defaultValue={project?.title ?? ""} placeholder="Nocturne" />
                </Field>
                <Field label="Slug" htmlFor="slug" hint="Leave blank to generate from the title." error={errors.slug}>
                  <Input id="slug" name="slug" defaultValue={project?.slug ?? ""} placeholder="nocturne" />
                </Field>
                <Field label="Description" htmlFor="description" error={errors.description}>
                  <Textarea id="description" name="description" rows={4} defaultValue={project?.description ?? ""} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Category" htmlFor="categoryId">
                    <Select id="categoryId" name="categoryId" defaultValue={project?.categoryId ?? ""}>
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Client" htmlFor="clientId">
                    <Select id="clientId" name="clientId" defaultValue={project?.clientId ?? ""}>
                      <option value="">None</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Location" htmlFor="location">
                    <Input id="location" name="location" defaultValue={project?.location ?? ""} placeholder="Paris" />
                  </Field>
                  <Field label="Year" htmlFor="year" error={errors.year}>
                    <Input id="year" name="year" type="number" defaultValue={project?.year ?? ""} placeholder="2025" />
                  </Field>
                </div>
                <Field label="Credits" htmlFor="credits" hint="One per line, e.g. photographer, styling.">
                  <Textarea id="credits" name="credits" rows={3} defaultValue={project?.credits ?? ""} />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ArrayInput name="services" label="Services" variant="tags" defaultValue={project?.services ?? []} placeholder="Add service" />
                  <ArrayInput name="tags" label="Tags" variant="tags" defaultValue={project?.tags ?? []} placeholder="Add tag" />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Gallery">
              <div className="mb-4">
                <Field label="Gallery layout" htmlFor="galleryLayout">
                  <Select id="galleryLayout" name="galleryLayout" defaultValue={project?.galleryLayout ?? "MIXED"}>
                    <option value="MIXED">Mixed (editorial rhythm)</option>
                    <option value="FULL_WIDTH">Full width</option>
                    <option value="TWO_COLUMN">Two column</option>
                    <option value="THREE_COLUMN">Three column</option>
                    <option value="PORTRAIT_LANDSCAPE">Portrait + landscape</option>
                  </Select>
                </Field>
              </div>
              <GalleryEditor name="images" defaultImages={defaultImages} />
            </AdminCard>

            <AdminCard title="SEO">
              <div className="space-y-4">
                <Field label="SEO title" htmlFor="seoTitle" hint="Defaults to the project title.">
                  <Input id="seoTitle" name="seoTitle" defaultValue={project?.seoTitle ?? ""} />
                </Field>
                <Field label="Meta description" htmlFor="seoDescription">
                  <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={project?.seoDescription ?? ""} />
                </Field>
                <ImageField name="ogImageId" label="Social share image (OG)" defaultValue={project?.ogImage ?? null} folder="og" aspect="aspect-[1200/630]" />
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Cover image">
              <ImageField name="coverId" defaultValue={project?.cover ?? null} folder="portfolio" aspect="aspect-[4/5]" />
            </AdminCard>

            <AdminCard title="Visibility">
              <div className="space-y-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={project?.status ?? "DRAFT"}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <Checkbox id="featured" name="featured" label="Feature on homepage" defaultChecked={project?.featured ?? false} />
                {project?.status === "PUBLISHED" && (
                  <a
                    href={`/portfolio/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-accent-deep underline underline-offset-4"
                  >
                    View live project ↗
                  </a>
                )}
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
