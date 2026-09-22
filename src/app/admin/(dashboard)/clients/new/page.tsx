import { PageHeader } from "@/components/admin/ui";
import { ClientForm } from "@/components/admin/clients/client-form";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        title="New Client"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Clients", href: "/admin/clients" }, { label: "New" }]}
      />
      <ClientForm />
    </div>
  );
}
