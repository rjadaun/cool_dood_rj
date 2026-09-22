import { PageHeader } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/package/package-form";

export default function NewPackagePage() {
  return (
    <div>
      <PageHeader
        title="New Package"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Packages", href: "/admin/packages" }, { label: "New" }]}
      />
      <PackageForm />
    </div>
  );
}
