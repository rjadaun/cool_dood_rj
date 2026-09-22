import Link from "next/link";
import { Plus, Images } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { HeroList } from "@/components/admin/hero/hero-list";

export default async function HeroAdminPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
    include: { image: true },
  });

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="The cinematic slider at the top of your homepage. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Hero Slides" }]}
        actions={
          <Link href="/admin/hero/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New slide
          </Link>
        }
      />
      {slides.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No hero slides yet"
          description="Add your first slide to bring the homepage to life."
          action={
            <Link href="/admin/hero/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New slide
            </Link>
          }
        />
      ) : (
        <HeroList
          slides={slides.map((s) => ({
            id: s.id,
            title: s.title,
            label: s.label,
            status: s.status,
            imageUrl: s.image?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
