import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ClientForm } from "@/components/admin/clients/client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, include: { logo: true, logoDark: true } });
  if (!client) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Client"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Clients", href: "/admin/clients" }, { label: "Edit" }]}
      />
      <ClientForm client={client} />
    </div>
  );
}
