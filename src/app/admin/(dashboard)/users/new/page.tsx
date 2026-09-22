import { requirePage } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/users/user-form";

export default async function NewUserPage() {
  await requirePage("ADMIN");

  return (
    <div>
      <PageHeader
        title="New User"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Users", href: "/admin/users" }, { label: "New" }]}
      />
      <UserForm />
    </div>
  );
}
