import { requirePage } from "@/lib/auth/rbac";
import { getSettings } from "@/lib/queries/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings/settings-form";

export default async function SettingsPage() {
  await requirePage("ADMIN");
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Global configuration for your website."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]}
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
