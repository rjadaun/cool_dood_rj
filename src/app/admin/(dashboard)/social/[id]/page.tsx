import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SocialForm } from "@/components/admin/social/social-form";

export default async function EditSocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await prisma.socialLink.findUnique({ where: { id } });
  if (!link) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Social Link"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Social Links", href: "/admin/social" }, { label: "Edit" }]}
      />
      <SocialForm link={link} />
    </div>
  );
}
