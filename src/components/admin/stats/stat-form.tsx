"use client";

import type { Stat } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/field";
import { saveStat } from "@/lib/actions/stats";

export function StatForm({ stat }: { stat?: Stat }) {
  return (
    <AdminForm action={saveStat} cancelHref="/admin/stats" hiddenId={stat?.id} submitLabel="Save stat">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminCard title="Content">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Value" htmlFor="value" required hint='e.g. "120+"' error={errors.value}>
                  <Input id="value" name="value" defaultValue={stat?.value ?? ""} placeholder="120+" />
                </Field>
                <Field label="Label" htmlFor="label" required hint='e.g. "Shoots Completed"' error={errors.label}>
                  <Input id="label" name="label" defaultValue={stat?.label ?? ""} placeholder="Shoots Completed" />
                </Field>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard title="Presentation">
              <div className="space-y-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={stat?.status ?? "PUBLISHED"}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </Field>
                <input type="hidden" name="sortOrder" value={stat?.sortOrder ?? 0} />
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
