import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id }, include: { image: true } });
  if (!testimonial) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Testimonial"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Testimonials", href: "/admin/testimonials" }, { label: "Edit" }]}
      />
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
