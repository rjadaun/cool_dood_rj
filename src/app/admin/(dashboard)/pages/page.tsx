import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" }, include: { _count: { select: { sections: true } } } });

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Edit the content of your standard site pages."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Pages" }]}
      />
      {pages.length === 0 ? (
        <EmptyState icon={Pencil} title="No pages found" description="Pages are seeded with your site content." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] font-medium uppercase tracking-wide text-stone-400">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Sections</th>
                <th className="px-4 py-3 font-medium">Visible</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-stone-500">/{p.slug}</td>
                  <td className="px-4 py-3 text-stone-500">{p._count.sections}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.visible ? "success" : "neutral"}>{p.visible ? "visible" : "hidden"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:underline"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
