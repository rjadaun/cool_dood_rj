import Link from "next/link";
import { Plus, Package as PackageIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { PackageList } from "@/components/admin/package/package-list";

export default async function PackagesAdminPage() {
  const packages = await prisma.package.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Pricing packages shown to visitors. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Packages" }]}
        actions={
          <Link href="/admin/packages/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New package
          </Link>
        }
      />
      {packages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="No packages yet"
          description="Add your first package to present your pricing."
          action={
            <Link href="/admin/packages/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New package
            </Link>
          }
        />
      ) : (
        <PackageList
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            featured: p.featured,
            status: p.status,
          }))}
        />
      )}
    </div>
  );
}
