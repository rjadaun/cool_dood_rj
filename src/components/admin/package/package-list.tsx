"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { reorderPackages, deletePackage, togglePackageStatus } from "@/lib/actions/package";

export interface PackageRow {
  id: string;
  name: string;
  price: string | null;
  featured: boolean;
  status: string;
}

export function PackageList({ packages }: { packages: PackageRow[] }) {
  return (
    <SortableList
      items={packages}
      onReorder={reorderPackages}
      renderItem={(pkg) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{pkg.name}</p>
            {pkg.price && <p className="text-xs text-stone-500">{pkg.price}</p>}
          </div>
          {pkg.featured && <Badge tone="accent">Featured</Badge>}
          <StatusBadge status={pkg.status} />
          <RowActions
            editHref={`/admin/packages/${pkg.id}`}
            deleteLabel="this package"
            onDelete={() => deletePackage(pkg.id)}
            onToggle={() => togglePackageStatus(pkg.id)}
            toggleLabel={pkg.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
