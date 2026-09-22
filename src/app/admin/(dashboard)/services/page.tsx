import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { ServiceList } from "@/components/admin/service/service-list";

export default async function ServicesAdminPage() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Services"
        description="What you offer, shown across the site. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Services" }]}
        actions={
          <Link href="/admin/services/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New service
          </Link>
        }
      />
      {services.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No services yet"
          description="Add your first service to describe what you offer."
          action={
            <Link href="/admin/services/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New service
            </Link>
          }
        />
      ) : (
        <ServiceList
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            number: s.number,
            status: s.status,
          }))}
        />
      )}
    </div>
  );
}
