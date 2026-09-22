"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/ui/badge";
import { reorderClients, deleteClient, toggleClientStatus } from "@/lib/actions/clients";

export interface ClientRow {
  id: string;
  name: string;
  website: string | null;
  status: string;
  imageUrl: string | null;
}

export function ClientList({ clients }: { clients: ClientRow[] }) {
  return (
    <SortableList
      items={clients}
      onReorder={reorderClients}
      renderItem={(client) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-stone-100">
            {client.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.imageUrl} alt="" className="h-full w-full object-contain p-1" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{client.name}</p>
            {client.website && <p className="truncate text-[10px] font-medium uppercase tracking-wide text-stone-400">{client.website}</p>}
          </div>
          <StatusBadge status={client.status} />
          <RowActions
            editHref={`/admin/clients/${client.id}`}
            deleteLabel="this client"
            onDelete={() => deleteClient(client.id)}
            onToggle={() => toggleClientStatus(client.id)}
            toggleLabel={client.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
