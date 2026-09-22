import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { ClientList } from "@/components/admin/clients/client-list";

export default async function ClientsAdminPage() {
  const clients = await prisma.client.findMany({
    orderBy: { sortOrder: "asc" },
    include: { logo: true, logoDark: true },
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Brands and clients you've worked with. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Clients" }]}
        actions={
          <Link href="/admin/clients/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New client
          </Link>
        }
      />
      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Add your first client or brand logo."
          action={
            <Link href="/admin/clients/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New client
            </Link>
          }
        />
      ) : (
        <ClientList
          clients={clients.map((c) => ({
            id: c.id,
            name: c.name,
            website: c.website,
            status: c.status,
            imageUrl: c.logo?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
