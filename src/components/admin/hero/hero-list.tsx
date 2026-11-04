"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderHeroSlides, deleteHeroSlide, duplicateHeroSlide, toggleHeroStatus } from "@/lib/actions/hero";

export interface HeroRow {
  id: string;
  title: string;
  label: string | null;
  status: string;
  imageUrl: string | null;
  mobileImageUrl: string | null;
}

export function HeroList({ slides }: { slides: HeroRow[] }) {
  return (
    <SortableList
      items={slides}
      onReorder={reorderHeroSlides}
      renderItem={(slide) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-stone-100">
            {slide.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {slide.label && <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">{slide.label}</p>}
            <p className="truncate text-sm font-medium text-ink">{slide.title}</p>
            <p className="mt-1 text-xs text-stone-500">
              {slide.mobileImageUrl ? "Mobile portrait added" : "Mobile uses desktop image"}
            </p>
          </div>
          <StatusBadge status={slide.status} />
          <RowActions
            editHref={`/admin/hero/${slide.id}`}
            deleteLabel="this hero slide"
            onDelete={() => deleteHeroSlide(slide.id)}
            onDuplicate={() => duplicateHeroSlide(slide.id)}
            onToggle={() => toggleHeroStatus(slide.id)}
            toggleLabel={slide.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
