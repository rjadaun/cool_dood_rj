import Link from "next/link";
import { Plus, Newspaper } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { JournalList } from "@/components/admin/journal/journal-list";
import { formatDate } from "@/lib/utils";

export default async function JournalAdminPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { cover: true },
  });

  return (
    <div>
      <PageHeader
        title="Journal"
        description="Long-form stories, editorials and studio notes."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Journal" }]}
        actions={
          <Link href="/admin/journal/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New post
          </Link>
        }
      />
      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No journal posts yet"
          description="Write your first post to share stories from the studio."
          action={
            <Link href="/admin/journal/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New post
            </Link>
          }
        />
      ) : (
        <JournalList
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            status: p.status,
            date: formatDate(p.updatedAt),
            imageUrl: p.cover?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
