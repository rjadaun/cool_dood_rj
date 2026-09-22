import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/categories/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, include: { cover: true } });
  if (!category) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Category"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Categories", href: "/admin/categories" }, { label: "Edit" }]}
      />
      <CategoryForm category={category} />
    </div>
  );
}
