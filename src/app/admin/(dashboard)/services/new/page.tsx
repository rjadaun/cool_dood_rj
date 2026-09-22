import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/service/service-form";

export default function NewServicePage() {
  return (
    <div>
      <PageHeader
        title="New Service"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Services", href: "/admin/services" }, { label: "New" }]}
      />
      <ServiceForm />
    </div>
  );
}
