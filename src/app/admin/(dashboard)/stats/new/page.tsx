import { PageHeader } from "@/components/admin/ui";
import { StatForm } from "@/components/admin/stats/stat-form";

export default function NewStatPage() {
  return (
    <div>
      <PageHeader
        title="New Stat"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Stats", href: "/admin/stats" }, { label: "New" }]}
      />
      <StatForm />
    </div>
  );
}
