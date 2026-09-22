import { LayoutTemplate } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { HomeSectionList } from "@/components/admin/homepage/home-section-list";

export default async function HomepageAdminPage() {
  const sections = await prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Reorder and show/hide homepage sections."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Homepage" }]}
      />
      {sections.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No homepage sections yet"
          description="Homepage sections are seeded with your site content."
        />
      ) : (
        <div className="max-w-2xl">
          <HomeSectionList
            sections={sections.map((s) => ({
              id: s.id,
              key: s.key,
              label: s.label,
              visible: s.visible,
            }))}
          />
        </div>
      )}
    </div>
  );
}
