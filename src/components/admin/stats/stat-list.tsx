"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderStats, deleteStat, toggleStatStatus } from "@/lib/actions/stats";

export interface StatRow {
  id: string;
  value: string;
  label: string;
  status: string;
}

export function StatList({ stats }: { stats: StatRow[] }) {
  return (
    <SortableList
      items={stats}
      onReorder={reorderStats}
      renderItem={(stat) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-stone-100 text-lg font-semibold text-ink">
            {stat.value}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{stat.label}</p>
          </div>
          <StatusBadge status={stat.status} />
          <RowActions
            editHref={`/admin/stats/${stat.id}`}
            deleteLabel="this stat"
            onDelete={() => deleteStat(stat.id)}
            onToggle={() => toggleStatStatus(stat.id)}
            toggleLabel={stat.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
