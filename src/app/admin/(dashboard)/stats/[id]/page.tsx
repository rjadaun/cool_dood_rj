import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { StatForm } from "@/components/admin/stats/stat-form";

export default async function EditStatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stat = await prisma.stat.findUnique({ where: { id } });
  if (!stat) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Stat"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Stats", href: "/admin/stats" }, { label: "Edit" }]}
      />
      <StatForm stat={stat} />
    </div>
  );
}
