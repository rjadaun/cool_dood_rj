"use client";

import type { SiteSetting } from "@prisma/client";
import { AdminForm } from "@/components/admin/form/admin-form";
import { AdminCard } from "@/components/admin/ui";
import { Field, Input, Textarea, Checkbox } from "@/components/ui/field";
import { saveSettings } from "@/lib/actions/settings";
import { LogoField } from "./logo-field";

export function SettingsForm({ settings }: { settings: SiteSetting }) {
  return (
    <AdminForm action={saveSettings} cancelHref="/admin" submitLabel="Save settings">
      {(errors) => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminCard title="Brand">
            <div className="space-y-4">
              <Field label="Site name" htmlFor="siteName" required error={errors.siteName}>
                <Input id="siteName" name="siteName" defaultValue={settings.siteName} placeholder="Rjadaun" />
              </Field>
              <Field label="Tagline" htmlFor="tagline" error={errors.tagline}>
                <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} placeholder="Editorial & commercial photography" />
              </Field>
              <Field label="Logo" hint="Transparent PNG or SVG works best · shown in the header before the site name." error={errors.logoUrl}>
                <LogoField name="logoUrl" defaultValue={settings.logoUrl} />
              </Field>
              <Field label="Favicon URL" htmlFor="faviconUrl" hint="Square PNG or ICO · 512×512." error={errors.faviconUrl}>
                <Input id="faviconUrl" name="faviconUrl" defaultValue={settings.faviconUrl ?? ""} placeholder="https://…/favicon.ico" />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email}>
                <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} placeholder="hello@lumiere.studio" />
              </Field>
              <Field label="Phone" htmlFor="phone" error={errors.phone}>
                <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} placeholder="+1 555 123 4567" />
              </Field>
              <Field label="Address" htmlFor="address" error={errors.address}>
                <Textarea id="address" name="address" rows={2} defaultValue={settings.address ?? ""} placeholder="Studio address" />
              </Field>
            </div>
          </AdminCard>

          <div className="space-y-6">
            <AdminCard title="SEO defaults">
              <div className="space-y-4">
                <Field label="Default SEO title" htmlFor="defaultSeoTitle" error={errors.defaultSeoTitle}>
                  <Input id="defaultSeoTitle" name="defaultSeoTitle" defaultValue={settings.defaultSeoTitle ?? ""} placeholder="Rjadaun · Photography" />
                </Field>
                <Field label="Default SEO description" htmlFor="defaultSeoDesc" error={errors.defaultSeoDesc}>
                  <Textarea id="defaultSeoDesc" name="defaultSeoDesc" rows={3} defaultValue={settings.defaultSeoDesc ?? ""} placeholder="A short description of your studio for search engines." />
                </Field>
                <Field label="Default OG image URL" htmlFor="ogImageUrl" hint="Social sharing preview · 1200×630 (1.91:1)." error={errors.ogImageUrl}>
                  <Input id="ogImageUrl" name="ogImageUrl" defaultValue={settings.ogImageUrl ?? ""} placeholder="https://…/og.jpg" />
                </Field>
              </div>
            </AdminCard>

            <AdminCard title="Analytics">
              <Field label="Google Analytics ID" htmlFor="gaId" hint="e.g. G-XXXXXXXXXX" error={errors.gaId}>
                <Input id="gaId" name="gaId" defaultValue={settings.gaId ?? ""} placeholder="G-XXXXXXXXXX" />
              </Field>
            </AdminCard>

            <AdminCard title="Options">
              <div className="space-y-4">
                <Field label="Contact email" htmlFor="contactEmail" hint="Where inquiry notifications are sent." error={errors.contactEmail}>
                  <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} placeholder="hello@lumiere.studio" />
                </Field>
                <Field label="Copyright" htmlFor="copyright" error={errors.copyright}>
                  <Input id="copyright" name="copyright" defaultValue={settings.copyright ?? ""} placeholder="© Rjadaun" />
                </Field>
                <Field label="Timezone" htmlFor="timezone" error={errors.timezone}>
                  <Input id="timezone" name="timezone" defaultValue={settings.timezone} placeholder="UTC" />
                </Field>
                <div className="space-y-3 border-t border-stone-100 pt-4">
                  <Checkbox id="maintenanceMode" name="maintenanceMode" defaultChecked={settings.maintenanceMode} label="Maintenance mode (hide public site)" />
                  <br />
                  <Checkbox id="showPricingPublic" name="showPricingPublic" defaultChecked={settings.showPricingPublic} label="Show pricing on the public site" />
                  <br />
                  <Checkbox id="newsletterEnabled" name="newsletterEnabled" defaultChecked={settings.newsletterEnabled} label="Enable newsletter sign-ups" />
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
