import Link from "next/link";
import { Plus, Share2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { SocialList } from "@/components/admin/social/social-list";

export default async function SocialAdminPage() {
  const links = await prisma.socialLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Social Links"
        description="Where visitors can find you. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Social Links" }]}
        actions={
          <Link href="/admin/social/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New link
          </Link>
        }
      />
      {links.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No social links yet"
          description="Add your first social profile so visitors can follow you."
          action={
            <Link href="/admin/social/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New link
            </Link>
          }
        />
      ) : (
        <SocialList
          links={links.map((l) => ({
            id: l.id,
            platform: l.platform,
            username: l.username,
            visible: l.visible,
          }))}
        />
      )}
    </div>
  );
}
