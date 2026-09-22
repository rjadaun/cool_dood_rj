import { Activity as ActivityIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { requirePage } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 30;

const actionTone: Record<string, "success" | "info" | "danger" | "warning" | "neutral"> = {
  create: "success",
  update: "info",
  delete: "danger",
  duplicate: "neutral",
  login: "warning",
};

export default async function ActivityAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePage("ADMIN");
  const { page: pageParam } = await searchParams;
  const parsed = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

  const total = await prisma.activityLog.count();
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, totalPages);

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    skip: (current - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  return (
    <div>
      <PageHeader
        title="Activity"
        description="A record of changes made across the admin."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Activity" }]}
      />
      {logs.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions taken in the admin will appear here." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-[11px] font-medium uppercase tracking-wide text-stone-400">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Summary</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-ink">{log.user?.name ?? "System"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={actionTone[log.action] ?? "neutral"}>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{log.entity}</td>
                    <td className="px-4 py-3 text-stone-500">{log.summary ?? "-"}</td>
                    <td className="px-4 py-3 text-stone-500">
                      {formatDate(log.createdAt, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-400">{log.ipAddress ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Pagination page={current} totalPages={totalPages} hrefForPage={(p) => `/admin/activity?page=${p}`} />
          </div>
        </>
      )}
    </div>
  );
}
