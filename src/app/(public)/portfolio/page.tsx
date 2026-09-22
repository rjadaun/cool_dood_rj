import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getCategories, getPortfolioProjects } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { PortfolioFilter } from "@/components/public/portfolio-filter";
import { ProjectCard } from "@/components/public/project-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { Reveal } from "@/components/shared/reveal";
import { ImageOff } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Portfolio",
    description: "Selected fashion, beauty and commercial photography projects.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, { projects, totalPages }] = await Promise.all([
    getCategories(),
    getPortfolioProjects({ category, page, perPage: 9 }),
  ]);

  const hrefForPage = (p: number) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/portfolio${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero label="Portfolio" title="Selected work." description="Fashion, beauty and commercial projects." />
      <section className="container-editorial py-14 md:py-16">
        <PortfolioFilter categories={categories.map((c) => ({ label: c.name, slug: c.slug }))} active={category} />

        {projects.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="No projects here yet"
            description="Try a different category, or check back soon."
            className="mt-16"
          />
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={(i % 3) * 0.06}>
                <ProjectCard
                  project={project}
                  aspect="aspect-[4/5]"
                  priority={i < 3}
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16">
            <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
          </div>
        )}
      </section>
    </>
  );
}
