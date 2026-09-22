import Link from "next/link";
import {
  FolderKanban, Star, Inbox, Mail, Quote, Building2, Newspaper, Plus,
  Images, Briefcase, ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PageHeader, StatCard, AdminCard } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  const [
    projects, featured, inquiries, unread, testimonials, clients, subscribers, posts,
    recentInquiries, recentProjects, recentActivity,
  ] = await Promise.all([
    prisma.portfolioProject.count(),
    prisma.portfolioProject.count({ where: { featured: true } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.testimonial.count(),
    prisma.client.count(),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.portfolioProject.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { category: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your website."
        actions={
          <Link
            href="/admin/portfolio/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Projects" value={projects} icon={FolderKanban} href="/admin/portfolio" />
        <StatCard label="Featured" value={featured} icon={Star} href="/admin/portfolio?featured=1" />
        <StatCard label="Unread inquiries" value={unread} icon={Inbox} href="/admin/inquiries" accent={unread > 0} />
        <StatCard label="Subscribers" value={subscribers} icon={Mail} href="/admin/newsletter" />
        <StatCard label="Total inquiries" value={inquiries} icon={Inbox} href="/admin/inquiries" />
        <StatCard label="Testimonials" value={testimonials} icon={Quote} href="/admin/testimonials" />
        <StatCard label="Clients" value={clients} icon={Building2} href="/admin/clients" />
        <StatCard label="Published articles" value={posts} icon={Newspaper} href="/admin/journal" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminCard
          title="Recent inquiries"
          className="lg:col-span-2"
          action={
            <Link href="/admin/inquiries" className="text-xs text-stone-500 hover:text-ink">
              View all
            </Link>
          }
        >
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-stone-400">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentInquiries.map((inq) => (
                <li key={inq.id}>
                  <Link href={`/admin/inquiries/${inq.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-stone-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{inq.name}</p>
                      <p className="truncate text-xs text-stone-400">
                        {inq.projectType || "General"} · {inq.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={inq.status} />
                      <span className="text-xs text-stone-400">{formatDate(inq.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Quick actions">
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Add project", href: "/admin/portfolio/new", icon: FolderKanban },
              { label: "Add hero slide", href: "/admin/hero/new", icon: Images },
              { label: "Add service", href: "/admin/services/new", icon: Briefcase },
              { label: "View inquiries", href: "/admin/inquiries", icon: Inbox },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between rounded-md border border-stone-200 px-4 py-3 text-sm text-ink hover:border-stone-300 hover:bg-stone-50"
              >
                <span className="flex items-center gap-3">
                  <a.icon className="h-4 w-4 text-stone-400" />
                  {a.label}
                </span>
                <ArrowRight className="h-4 w-4 text-stone-300" />
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard title="Recently updated projects">
          {recentProjects.length === 0 ? (
            <p className="text-sm text-stone-400">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/portfolio/${p.id}`} className="flex items-center justify-between py-3 hover:bg-stone-50">
                    <div>
                      <p className="text-sm font-medium text-ink">{p.title}</p>
                      <p className="text-xs text-stone-400">{p.category?.name ?? "Uncategorized"}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="Recent activity">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-stone-400">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-ink">
                      <span className="font-medium">{log.user?.name ?? "System"}</span>{" "}
                      {log.action} {log.entity.replace(/([A-Z])/g, " $1").toLowerCase().trim()}
                    </p>
                    <p className="text-xs text-stone-400">{formatDate(log.createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
