"use client";

import { SortableList } from "@/components/admin/sortable-list";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { reorderTestimonials, deleteTestimonial, duplicateTestimonial, toggleTestimonialStatus } from "@/lib/actions/testimonials";

export interface TestimonialRow {
  id: string;
  name: string;
  company: string | null;
  featured: boolean;
  status: string;
  imageUrl: string | null;
}

export function TestimonialList({ testimonials }: { testimonials: TestimonialRow[] }) {
  return (
    <SortableList
      items={testimonials}
      onReorder={reorderTestimonials}
      renderItem={(testimonial) => (
        <div className="flex items-center gap-4 py-2.5 pr-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-100">
            {testimonial.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={testimonial.imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{testimonial.name}</p>
            {testimonial.company && <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">{testimonial.company}</p>}
          </div>
          {testimonial.featured && <Badge tone="accent">Featured</Badge>}
          <StatusBadge status={testimonial.status} />
          <RowActions
            editHref={`/admin/testimonials/${testimonial.id}`}
            deleteLabel="this testimonial"
            onDelete={() => deleteTestimonial(testimonial.id)}
            onDuplicate={() => duplicateTestimonial(testimonial.id)}
            onToggle={() => toggleTestimonialStatus(testimonial.id)}
            toggleLabel={testimonial.status === "PUBLISHED" ? "Set to draft" : "Publish"}
          />
        </div>
      )}
    />
  );
}
