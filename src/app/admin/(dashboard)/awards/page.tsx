import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { AwardList } from "@/components/admin/awards/award-list";

export default async function AwardsAdminPage() {
  const awards = await prisma.award.findMany({
    orderBy: { sortOrder: "asc" },
    include: { logo: true },
  });

  return (
    <div>
      <PageHeader
        title="Awards"
        description="Recognition and accolades. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Awards" }]}
        actions={
          <Link href="/admin/awards/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New award
          </Link>
        }
      />
      {awards.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No awards yet"
          description="Add your first award or recognition."
          action={
            <Link href="/admin/awards/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New award
            </Link>
          }
        />
      ) : (
        <AwardList
          awards={awards.map((a) => ({
            id: a.id,
            name: a.name,
            year: a.year,
            status: a.status,
            imageUrl: a.logo?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
