"use client";

import type { SocialLink } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Select, Checkbox } from "@/components/ui/field";
import { saveSocial } from "@/lib/actions/social";

const PLATFORMS = ["INSTAGRAM", "YOUTUBE", "BEHANCE", "PINTEREST", "LINKEDIN", "FACEBOOK", "TIKTOK", "X"] as const;

export function SocialForm({ link }: { link?: SocialLink }) {
  return (
    <AdminForm action={saveSocial} cancelHref="/admin/social" hiddenId={link?.id} submitLabel="Save link">
      {(errors) => (
        <div className="mx-auto max-w-2xl">
          <AdminCard title="Social link">
            <div className="space-y-4">
              <Field label="Platform" htmlFor="platform" required error={errors.platform}>
                <Select id="platform" name="platform" defaultValue={link?.platform ?? "INSTAGRAM"}>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </Field>
              <Field label="URL" htmlFor="url" required error={errors.url}>
                <Input id="url" name="url" defaultValue={link?.url ?? ""} placeholder="https://instagram.com/yourhandle" />
              </Field>
              <Field label="Username" htmlFor="username" hint="Optional handle shown as @username." error={errors.username}>
                <Input id="username" name="username" defaultValue={link?.username ?? ""} placeholder="yourhandle" />
              </Field>
              <Checkbox id="visible" name="visible" value="true" defaultChecked={link?.visible ?? true} label="Visible on the site" />
              <input type="hidden" name="sortOrder" value={link?.sortOrder ?? 0} />
            </div>
          </AdminCard>
        </div>
      )}
    </AdminForm>
  );
}
