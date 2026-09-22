import Link from "next/link";
import { Download, Search, Mail, Users, UserCheck } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader, AdminCard, StatCard } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { RowActions } from "@/components/admin/row-actions";
import { deleteSubscriber, toggleSubscriberActive } from "@/lib/actions/newsletter";

const PER_PAGE = 15;

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.NewsletterSubscriberWhereInput = q
    ? { email: { contains: q, mode: "insensitive" } }
    : {};

  const [total, active, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const totalAll = await prisma.newsletterSubscriber.count();

  const hrefForPage = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/newsletter${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Newsletter"
        description="People who subscribed to your studio updates."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Newsletter" }]}
        actions={
          <a
            href="/api/admin/newsletter/export"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 px-4 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total subscribers" value={totalAll} icon={Users} />
        <StatCard label="Active" value={active} icon={UserCheck} />
      </div>

      <form method="get" className="mb-5">
        <div className="relative sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input name="q" defaultValue={q} placeholder="Search by email…" className="pl-10" aria-label="Search subscribers" />
        </div>
      </form>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={q ? "No matching subscribers" : "No subscribers yet"}
          description={q ? "Try a different search." : "New sign-ups from your website will appear here."}
          action={
            q ? (
              <Link href="/admin/newsletter" className="inline-flex h-10 items-center rounded-md border border-stone-200 px-4 text-sm font-medium text-ink hover:bg-stone-50">
                Clear search
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <AdminCard className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Source</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Subscribed</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3 font-medium text-ink">{s.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "active" : "inactive"}</Badge>
                    </td>
                    <td className="hidden px-5 py-3 text-stone-500 sm:table-cell">{s.source || "-"}</td>
                    <td className="hidden px-5 py-3 text-stone-400 sm:table-cell">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end">
                        <RowActions
                          onToggle={toggleSubscriberActive.bind(null, s.id)}
                          toggleLabel={s.active ? "Deactivate" : "Reactivate"}
                          onDelete={deleteSubscriber.bind(null, s.id)}
                          deleteLabel={`${s.email} from your list`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {total} {total === 1 ? "subscriber" : "subscribers"}
            </p>
            <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
          </div>
        </>
      )}
    </div>
  );
}
