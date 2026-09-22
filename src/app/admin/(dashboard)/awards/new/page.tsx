import { PageHeader } from "@/components/admin/ui";
import { AwardForm } from "@/components/admin/awards/award-form";

export default function NewAwardPage() {
  return (
    <div>
      <PageHeader
        title="New Award"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Awards", href: "/admin/awards" }, { label: "New" }]}
      />
      <AwardForm />
    </div>
  );
}
