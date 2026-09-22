import { PageHeader } from "@/components/admin/ui";
import { JournalForm } from "@/components/admin/journal/journal-form";

export default function NewJournalPostPage() {
  return (
    <div>
      <PageHeader
        title="New Post"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Journal", href: "/admin/journal" }, { label: "New" }]}
      />
      <JournalForm />
    </div>
  );
}
