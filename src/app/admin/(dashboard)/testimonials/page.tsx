import Link from "next/link";
import { Plus, Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { TestimonialList } from "@/components/admin/testimonials/testimonial-list";

export default async function TestimonialsAdminPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
    include: { image: true },
  });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client quotes and endorsements. Drag to reorder."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Testimonials" }]}
        actions={
          <Link href="/admin/testimonials/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-soft">
            <Plus className="h-4 w-4" /> New testimonial
          </Link>
        }
      />
      {testimonials.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No testimonials yet"
          description="Add your first client testimonial."
          action={
            <Link href="/admin/testimonials/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper">
              <Plus className="h-4 w-4" /> New testimonial
            </Link>
          }
        />
      ) : (
        <TestimonialList
          testimonials={testimonials.map((t) => ({
            id: t.id,
            name: t.name,
            company: t.company,
            featured: t.featured,
            status: t.status,
            imageUrl: t.image?.url ?? null,
          }))}
        />
      )}
    </div>
  );
}
