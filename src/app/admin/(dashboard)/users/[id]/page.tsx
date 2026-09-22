import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePage } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/users/user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("ADMIN");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div>
      <PageHeader
        title="Edit User"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Users", href: "/admin/users" }, { label: "Edit" }]}
      />
      <UserForm user={user} />
    </div>
  );
}
