import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { getProjectBySlug, getRelatedProjects } from "@/lib/queries/public";
import { ProjectGallery } from "@/components/public/project-gallery";
import { ProjectCollection } from "@/components/public/project-collection";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return buildMetadata({ title: "Project", noIndex: true });
  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.description,
    path: `/portfolio/${project.slug}`,
    image: project.ogImage?.url || project.cover?.url,
    type: "article",
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(project.id, project.categoryId);
  // Show a unique cover once; preserve every configured gallery image and its order.
  const galleryImages =
    project.cover &&
    !project.images.some((image) => image.mediaId === project.coverId)
      ? [
          {
            id: `cover-${project.id}`,
            media: project.cover,
            caption: null,
            altText: project.cover.altText || project.title,
            aspect: "ORIGINAL" as const,
          },
          ...project.images,
        ]
      : project.images;

  const meta = [
    { label: "Category", value: project.category?.name },
    { label: "Client", value: project.client?.name },
    { label: "Year", value: project.year?.toString() },
    { label: "Location", value: project.location },
  ].filter((m) => m.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description ?? undefined,
    image: project.cover?.url ? absoluteUrl(project.cover.url) : undefined,
    dateCreated: project.year ? `${project.year}` : undefined,
    creator: { "@type": "Organization", name: "Rjadaun" },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="container-editorial project-intro">
        <Link href="/portfolio" className="project-back">
          <ArrowLeft size={15} /> All work
        </Link>
        <div className="project-title-row">
          <h1>{project.title}</h1>
          {project.category && <span>{project.category.name}</span>}
        </div>
        {(project.description ||
          meta.length > 0 ||
          project.services.length > 0) && (
          <div className="project-details">
            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
            <dl className="project-metadata">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
              {project.services.length > 0 && (
                <div>
                  <dt>Services</dt>
                  <dd>{project.services.join(", ")}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </header>
      {galleryImages.length > 0 && (
        <div className="container-editorial">
          <ProjectGallery
            images={galleryImages}
            layout={project.galleryLayout}
          />
        </div>
      )}

      {/* Credits */}
      {project.credits && (
        <div className="container-editorial project-credits">
          <h2 className="label text-stone-400">Credits</h2>
          <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {project.credits}
          </p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="container-editorial section-space">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-light text-ink">
              Related work
            </h2>
            <Link
              href="/portfolio"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium tracking-normal text-ink"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProjectCollection projects={related} />
        </section>
      )}

      <div className="pb-10" />
    </article>
  );
}
