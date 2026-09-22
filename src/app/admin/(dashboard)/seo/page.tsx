import Link from "next/link";
import { ExternalLink, FileText, Map, Settings as SettingsIcon } from "lucide-react";
import { requirePage } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/queries/settings";
import { PageHeader, AdminCard } from "@/components/admin/ui";

function SeoDot({ filled }: { filled: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${filled ? "bg-emerald-500" : "bg-stone-300"}`}
      aria-label={filled ? "SEO fields set" : "SEO fields missing"}
    />
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-b border-stone-100 py-2.5 last:border-0">
      <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value || <span className="text-stone-300">Not set</span>}</p>
    </div>
  );
}

const has = (v: string | null) => Boolean(v && v.trim().length);

export default async function SeoPage() {
  await requirePage("ADMIN");

  const [settings, projects, posts] = await Promise.all([
    getSettings(),
    prisma.portfolioProject.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, seoTitle: true, seoDescription: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, seoTitle: true, seoDescription: true },
    }),
  ]);

  const rows = [
    ...projects.map((p) => ({ ...p, kind: "portfolio" as const, href: `/admin/portfolio/${p.id}` })),
    ...posts.map((p) => ({ ...p, kind: "journal" as const, href: `/admin/journal/${p.id}` })),
  ];

  return (
    <div>
      <PageHeader
        title="SEO"
        description="Default metadata, per-page SEO coverage, and site files."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "SEO" }]}
        actions={
          <Link
            href="/admin/settings"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 px-4 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <SettingsIcon className="h-4 w-4" /> Edit in Settings
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminCard
            title="Default metadata"
            action={
              <Link href="/admin/settings" className="text-xs text-stone-500 hover:text-ink">
                Edit
              </Link>
            }
          >
            <dl>
              <ReadOnlyField label="Default SEO title" value={settings.defaultSeoTitle} />
              <ReadOnlyField label="Default SEO description" value={settings.defaultSeoDesc} />
              <ReadOnlyField label="Default OG image" value={settings.ogImageUrl} />
            </dl>
          </AdminCard>

          <AdminCard title="Per-page SEO coverage" className="overflow-hidden">
            {rows.length === 0 ? (
              <p className="text-sm text-stone-400">No published projects or articles yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                    <th className="py-2 pr-4 font-medium">Page</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Title</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((r) => (
                    <tr key={`${r.kind}-${r.id}`} className="hover:bg-stone-50">
                      <td className="py-2.5 pr-4">
                        <Link href={r.href} className="font-medium text-ink hover:underline">
                          {r.title}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-stone-400 capitalize">{r.kind}</td>
                      <td className="py-2.5 pr-4"><SeoDot filled={has(r.seoTitle)} /></td>
                      <td className="py-2.5 pr-4"><SeoDot filled={has(r.seoDescription)} /></td>
                      <td className="py-2.5 text-right">
                        <Link href={r.href} className="text-xs text-stone-500 hover:text-ink">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-4 flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><SeoDot filled /> Filled</span>
              <span className="flex items-center gap-1.5"><SeoDot filled={false} /> Missing</span>
            </p>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Site files">
            <ul className="space-y-2">
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-stone-200 px-4 py-3 text-sm text-ink hover:bg-stone-50">
                  <span className="flex items-center gap-2.5"><Map className="h-4 w-4 text-stone-400" /> Sitemap</span>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-300" />
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-stone-200 px-4 py-3 text-sm text-ink hover:bg-stone-50">
                  <span className="flex items-center gap-2.5"><FileText className="h-4 w-4 text-stone-400" /> robots.txt</span>
                  <ExternalLink className="h-3.5 w-3.5 text-stone-300" />
                </a>
              </li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
