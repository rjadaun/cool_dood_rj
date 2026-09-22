"use client";

import { RowActions } from "@/components/admin/row-actions";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { deleteUser } from "@/lib/actions/users";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  isSelf: boolean;
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

const roleTone: Record<string, "accent" | "info" | "neutral"> = {
  SUPER_ADMIN: "accent",
  ADMIN: "info",
  EDITOR: "neutral",
};

export function UserList({ users }: { users: UserRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-[11px] font-medium uppercase tracking-wide text-stone-400">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last login</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{user.name}</span>
                  {user.isSelf && <Badge tone="success">You</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-stone-500">{user.email}</td>
              <td className="px-4 py-3">
                <Badge tone={roleTone[user.role] ?? "neutral"}>{roleLabel[user.role] ?? user.role}</Badge>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-stone-500">{user.lastLogin ?? "Never"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <RowActions
                    editHref={`/admin/users/${user.id}`}
                    deleteLabel="this user"
                    onDelete={user.isSelf ? undefined : () => deleteUser(user.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
