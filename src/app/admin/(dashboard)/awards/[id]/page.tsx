import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { AwardForm } from "@/components/admin/awards/award-form";

export default async function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const award = await prisma.award.findUnique({ where: { id }, include: { logo: true } });
  if (!award) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Award"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Awards", href: "/admin/awards" }, { label: "Edit" }]}
      />
      <AwardForm award={award} />
    </div>
  );
}
