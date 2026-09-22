import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/service/service-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { image: true, features: true },
  });
  if (!service) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Service"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Services", href: "/admin/services" }, { label: "Edit" }]}
      />
      <ServiceForm service={service} />
    </div>
  );
}
