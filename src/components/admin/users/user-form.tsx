"use client";

import type { User } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { saveUser } from "@/lib/actions/users";

export function UserForm({ user }: { user?: User }) {
  const isEdit = Boolean(user);

  return (
    <AdminForm action={saveUser} cancelHref="/admin/users" hiddenId={user?.id} submitLabel="Save user">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Account">
              <div className="space-y-4">
                <Field label="Name" htmlFor="name" required error={errors.name}>
                  <Input id="name" name="name" defaultValue={user?.name ?? ""} placeholder="Jane Doe" />
                </Field>
                <Field label="Email" htmlFor="email" required error={errors.email}>
                  <Input id="email" name="email" type="email" defaultValue={user?.email ?? ""} placeholder="jane@example.com" />
                </Field>
                <Field
                  label="Password"
                  htmlFor="password"
                  required={!isEdit}
                  hint={isEdit ? "Leave blank to keep the current password." : "Minimum 8 characters."}
                  error={errors.password}
                >
                  <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Access">
              <div className="space-y-4">
                <Field label="Role" htmlFor="role" error={errors.role}>
                  <Select id="role" name="role" defaultValue={user?.role ?? "EDITOR"}>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super admin</option>
                  </Select>
                </Field>
                <Field label="Status" htmlFor="status" error={errors.status}>
                  <Select id="status" name="status" defaultValue={user?.status ?? "ACTIVE"}>
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </Select>
                </Field>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
