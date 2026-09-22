import { PageHeader } from "@/components/admin/ui";
import { SocialForm } from "@/components/admin/social/social-form";

export default function NewSocialPage() {
  return (
    <div>
      <PageHeader
        title="New Social Link"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Social Links", href: "/admin/social" }, { label: "New" }]}
      />
      <SocialForm />
    </div>
  );
}
