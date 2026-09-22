import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <PageHeader
        title="New Testimonial"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Testimonials", href: "/admin/testimonials" }, { label: "New" }]}
      />
      <TestimonialForm />
    </div>
  );
}
