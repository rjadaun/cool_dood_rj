import Link from "next/link";
import { Plus, Users as UsersIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePage } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { UserList } from "@/components/admin/users/user-list";
import { formatDate } from "@/lib/utils";

export default async function UsersAdminPage() {
  const current = await requirePage("ADMIN");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage who can access the admin and what they can do."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Users" }]}
        actions={
          <Link href="/admin/users/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New user
          </Link>
        }
      />
      {users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users yet" description="Add a teammate to give them access." />
      ) : (
        <UserList
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            lastLogin: u.lastLoginAt ? formatDate(u.lastLoginAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null,
            isSelf: u.id === current.id,
          }))}
        />
      )}
    </div>
  );
}
