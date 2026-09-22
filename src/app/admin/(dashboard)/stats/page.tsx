import Link from "next/link";
import { Plus, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { StatList } from "@/components/admin/stats/stat-list";

export default async function StatsAdminPage() {
  const stats = await prisma.stat.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Stats"
        description="Headline numbers shown on your homepage. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Stats" }]}
        actions={
          <Link href="/admin/stats/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New stat
          </Link>
        }
      />
      {stats.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No stats yet"
          description="Add your first headline statistic."
          action={
            <Link href="/admin/stats/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New stat
            </Link>
          }
        />
      ) : (
        <StatList
          stats={stats.map((s) => ({
            id: s.id,
            value: s.value,
            label: s.label,
            status: s.status,
          }))}
        />
      )}
    </div>
  );
}
