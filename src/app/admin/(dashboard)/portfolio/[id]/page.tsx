import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { PortfolioForm } from "@/components/admin/portfolio/portfolio-form";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories, clients] = await Promise.all([
    prisma.portfolioProject.findUnique({
      where: { id },
      include: {
        cover: true,
        ogImage: true,
        images: { orderBy: { sortOrder: "asc" }, include: { media: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.client.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div>
      <PageHeader
        title={project.title}
        description="Edit project details, gallery and SEO."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Portfolio", href: "/admin/portfolio" }, { label: "Edit" }]}
      />
      <PortfolioForm project={project} categories={categories} clients={clients} />
    </div>
  );
}
