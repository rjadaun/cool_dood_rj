"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderCategories, deleteCategory, toggleCategoryStatus } from "@/lib/actions/categories";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  imageUrl: string | null;
}

export function CategoryList({ categories }: { categories: CategoryRow[] }) {
  return (
    <SortableList
      items={categories}
      onReorder={reorderCategories}
      renderItem={(category) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded bg-stone-100">
            {category.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{category.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">{category.slug}</p>
          </div>
          <StatusBadge status={category.status} />
          <RowActions
            editHref={`/admin/categories/${category.id}`}
            deleteLabel="this category"
            onDelete={() => deleteCategory(category.id)}
            onToggle={() => toggleCategoryStatus(category.id)}
            toggleLabel={category.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
