"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderAwards, deleteAward, toggleAwardStatus } from "@/lib/actions/awards";

export interface AwardRow {
  id: string;
  name: string;
  year: number | null;
  status: string;
  imageUrl: string | null;
}

export function AwardList({ awards }: { awards: AwardRow[] }) {
  return (
    <SortableList
      items={awards}
      onReorder={reorderAwards}
      renderItem={(award) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-stone-100">
            {award.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={award.imageUrl} alt="" className="h-full w-full object-contain p-1" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{award.name}</p>
            {award.year && <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">{award.year}</p>}
          </div>
          <StatusBadge status={award.status} />
          <RowActions
            editHref={`/admin/awards/${award.id}`}
            deleteLabel="this award"
            onDelete={() => deleteAward(award.id)}
            onToggle={() => toggleAwardStatus(award.id)}
            toggleLabel={award.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
