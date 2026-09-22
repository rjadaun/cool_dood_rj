import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { PageForm } from "@/components/admin/pages/page-form";
import { PageSectionsEditor } from "@/components/admin/pages/page-sections-editor";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { sortOrder: "asc" } }, image: true },
  });
  if (!page) notFound();

  const { sections, ...pageData } = page;

  return (
    <div>
      <PageHeader
        title={`Edit ${page.title}`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Pages", href: "/admin/pages" }, { label: page.title }]}
      />
      <PageForm page={pageData} />
      <div className="mt-12 border-t border-stone-200 pt-10">
        <PageSectionsEditor pageId={page.id} sections={sections} />
      </div>
    </div>
  );
}
