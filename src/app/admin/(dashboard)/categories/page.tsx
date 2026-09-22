import Link from "next/link";
import { Plus, FolderOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { CategoryList } from "@/components/admin/categories/category-list";

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { cover: true },
  });

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group your portfolio work into categories. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Categories" }]}
        actions={
          <Link href="/admin/categories/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New category
          </Link>
        }
      />
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Add your first category to organize your portfolio."
          action={
            <Link href="/admin/categories/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New category
            </Link>
          }
        />
      ) : (
        <CategoryList
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            status: c.status,
            imageUrl: c.cover?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
