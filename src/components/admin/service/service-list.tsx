"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderServices, deleteService, toggleServiceStatus } from "@/lib/actions/service";

export interface ServiceRow {
  id: string;
  name: string;
  number: string | null;
  status: string;
}

export function ServiceList({ services }: { services: ServiceRow[] }) {
  return (
    <SortableList
      items={services}
      onReorder={reorderServices}
      renderItem={(service) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-stone-100 text-sm font-medium text-stone-500">
            {service.number ?? "-"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{service.name}</p>
          </div>
          <StatusBadge status={service.status} />
          <RowActions
            editHref={`/admin/services/${service.id}`}
            deleteLabel="this service"
            onDelete={() => deleteService(service.id)}
            onToggle={() => toggleServiceStatus(service.id)}
            toggleLabel={service.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
