import { PageHeader } from "@/components/admin/ui";
import { HeroForm } from "@/components/admin/hero/hero-form";

export default function NewHeroSlidePage() {
  return (
    <div>
      <PageHeader
        title="New Hero Slide"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Hero Slides", href: "/admin/hero" }, { label: "New" }]}
      />
      <HeroForm />
    </div>
  );
}
