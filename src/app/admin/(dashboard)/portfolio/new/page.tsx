import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { PortfolioForm } from "@/components/admin/portfolio/portfolio-form";

export default async function NewPortfolioPage() {
  const [categories, clients] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.client.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="New Project"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Portfolio", href: "/admin/portfolio" }, { label: "New" }]}
      />
      <PortfolioForm categories={categories} clients={clients} />
    </div>
  );
}
