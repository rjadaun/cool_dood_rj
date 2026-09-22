import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { PortfolioToolbar } from "@/components/admin/portfolio/portfolio-toolbar";
import { PortfolioTable } from "@/components/admin/portfolio/portfolio-table";

const PER_PAGE = 12;

export default async function PortfolioAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; featured?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.PortfolioProjectWhereInput = {
    ...(sp.q
      ? { OR: [{ title: { contains: sp.q, mode: "insensitive" } }, { description: { contains: sp.q, mode: "insensitive" } }] }
      : {}),
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.status ? { status: sp.status as Prisma.EnumPublishStatusFilter["equals"] } : {}),
    ...(sp.featured === "1" ? { featured: true } : {}),
  };

  const [projects, total, categories] = await Promise.all([
    prisma.portfolioProject.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      include: { category: true, client: true, cover: true },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.portfolioProject.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hrefForPage = (p: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.category) params.set("category", sp.category);
    if (sp.status) params.set("status", sp.status);
    if (sp.featured) params.set("featured", sp.featured);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/portfolio${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description={`${total} project${total === 1 ? "" : "s"}`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Portfolio" }]}
        actions={
          <Link href="/admin/portfolio/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />

      <PortfolioToolbar categories={categories} />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your filters, or create a new project."
          action={
            <Link href="/admin/portfolio/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New project
            </Link>
          }
        />
      ) : (
        <>
          <PortfolioTable
            rows={projects.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              category: p.category?.name ?? null,
              client: p.client?.name ?? null,
              status: p.status,
              featured: p.featured,
              updatedAt: formatDate(p.updatedAt),
              coverUrl: p.cover?.url ?? null,
            }))}
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
