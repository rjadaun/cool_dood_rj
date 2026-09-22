import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { getProjectBySlug, getRelatedProjects } from "@/lib/queries/public";
import { MediaImage } from "@/components/shared/media-image";
import { ProjectGallery } from "@/components/public/project-gallery";
import { ProjectCard } from "@/components/public/project-card";
import { Reveal } from "@/components/shared/reveal";

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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = await getRelatedProjects(project.id, project.categoryId);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <div className="container-editorial pt-32 md:pt-40">
        <Link
          href="/portfolio"
          className="link-underline inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-wide text-stone-500"
        >
          <ArrowLeft className="h-4 w-4" /> All work
        </Link>
        <Reveal>
          <p className="mt-8 label text-stone-500">{project.category?.name}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-4 max-w-4xl font-serif text-display-lg font-light leading-[0.98] text-ink">
            {project.title}
          </h1>
        </Reveal>
      </div>

      {/* Cover */}
      <div className="container-editorial mt-12 md:mt-16">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <MediaImage media={project.cover} alt={project.title} priority sizes="100vw" />
        </div>
      </div>

      {/* Intro + meta */}
      <div className="container-editorial mt-16 grid grid-cols-1 gap-12 md:mt-20 md:grid-cols-12">
        <div className="md:col-span-7">
          {project.description && (
            <p className="max-w-prose font-serif text-2xl font-light leading-[1.5] text-ink md:text-3xl">
              {project.description}
            </p>
          )}
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <dl className="grid grid-cols-2 gap-y-6">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="label text-stone-400">{m.label}</dt>
                <dd className="mt-1 text-sm text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
          {project.services.length > 0 && (
            <div className="mt-8">
              <dt className="label text-stone-400">Services</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {project.services.map((s) => (
                  <span key={s} className="border border-line px-2.5 py-1 text-xs text-ink/70">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {project.images.length > 0 && (
        <div className="container-editorial mt-20 md:mt-28">
          <ProjectGallery images={project.images} layout={project.galleryLayout} />
        </div>
      )}

      {/* Credits */}
      {project.credits && (
        <div className="container-editorial mt-20 border-t border-line pt-12">
          <h2 className="label text-stone-400">Credits</h2>
          <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink/70">
            {project.credits}
          </p>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="container-editorial mt-24 border-t border-line pt-16 md:mt-32">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl font-light text-ink">Related work</h2>
            <Link
              href="/portfolio"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ProjectCard key={r.id} project={r} aspect="aspect-[4/5]" sizes="(max-width:768px) 100vw, 33vw" />
            ))}
          </div>
        </section>
      )}

      <div className="h-24" />
    </article>
  );
}
