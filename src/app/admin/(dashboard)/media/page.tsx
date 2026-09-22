import { PageHeader } from "@/components/admin/ui";
import { MediaManager } from "@/components/admin/media/media-manager";

export default function MediaPage() {
  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload, organise and reuse images across your website."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
      />
      <MediaManager />
    </div>
  );
}
