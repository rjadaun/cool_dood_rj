import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/package/package-form";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: { features: true },
  });
  if (!pkg) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Package"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Packages", href: "/admin/packages" }, { label: "Edit" }]}
      />
      <PackageForm pkg={pkg} />
    </div>
  );
}
