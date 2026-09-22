import Link from "next/link";
import { Download, Search, Inbox } from "lucide-react";
import type { Prisma, InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";

const PER_PAGE = 15;
const STATUSES: InquiryStatus[] = ["NEW", "READ", "CONTACTED", "ARCHIVED"];

function isStatus(v: string): v is InquiryStatus {
  return (STATUSES as string[]).includes(v);
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" && isStatus(sp.status) ? sp.status : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.InquiryWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, inquiries] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const hrefForPage = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/inquiries${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Contact form submissions from your website."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Inquiries" }]}
        actions={
          <a
            href="/api/admin/inquiries/export"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 px-4 text-sm font-medium text-ink hover:bg-stone-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search name, email or message…"
            className="pl-10"
            aria-label="Search inquiries"
          />
        </div>
        <Select name="status" defaultValue={status} aria-label="Filter by status" className="sm:w-48">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Filter
        </button>
      </form>

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q || status ? "No matching inquiries" : "No inquiries yet"}
          description={
            q || status
              ? "Try a different search or clear the filters."
              : "New contact form submissions will appear here."
          }
          action={
            q || status ? (
              <Link href="/admin/inquiries" className="inline-flex h-10 items-center rounded-md border border-stone-200 px-4 text-sm font-medium text-ink hover:bg-stone-50">
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <AdminCard className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="group hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/inquiries/${inq.id}`} className="flex items-center gap-2 font-medium text-ink">
                        {inq.status === "NEW" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                        <span className={inq.status === "NEW" ? "font-semibold" : ""}>{inq.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{inq.email}</td>
                    <td className="px-5 py-3 text-stone-500">{inq.projectType || "-"}</td>
                    <td className="px-5 py-3"><StatusBadge status={inq.status} /></td>
                    <td className="px-5 py-3 text-stone-400">{formatDate(inq.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {inquiries.map((inq) => (
              <Link
                key={inq.id}
                href={`/admin/inquiries/${inq.id}`}
                className={`block rounded-lg border bg-white p-4 ${inq.status === "NEW" ? "border-accent/40" : "border-stone-200"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`truncate text-sm text-ink ${inq.status === "NEW" ? "font-semibold" : "font-medium"}`}>{inq.name}</p>
                    <p className="truncate text-xs text-stone-500">{inq.email}</p>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
                  <span>{inq.projectType || "General inquiry"}</span>
                  <span>{formatDate(inq.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {total} {total === 1 ? "inquiry" : "inquiries"}
            </p>
            <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
          </div>
        </>
      )}
    </div>
  );
}
