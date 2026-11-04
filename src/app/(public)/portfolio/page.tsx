import { mediaPage } from "@/lib/media/shared";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getCategories, getPortfolioProjects } from "@/lib/queries/public";
import { CmsPageIntro } from "@/components/public/cms-page-intro";
import { PortfolioFilter } from "@/components/public/portfolio-filter";
import { ProjectCollection } from "@/components/public/project-collection";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { ImageOff } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "portfolio",
    "Portfolio",
    "Selected fashion, beauty and commercial photography projects.",
  );
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const page = mediaPage(params.page ?? null);

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
      <CmsPageIntro
        slug="portfolio"
        label="Portfolio"
        title="Selected work."
        description="Fashion, beauty and commercial projects."
      />
      <section className="container-editorial portfolio-content">
        <PortfolioFilter
          categories={categories.map((c) => ({ label: c.name, slug: c.slug }))}
          active={category}
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="No projects here yet"
            description="Try a different category, or check back soon."
            className="mt-16"
          />
        ) : (
          <ProjectCollection projects={projects} priority />
        )}

        {totalPages > 1 && (
          <div className="mt-16">
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefForPage={hrefForPage}
            />
          </div>
        )}
      </section>
    </>
  );
}
