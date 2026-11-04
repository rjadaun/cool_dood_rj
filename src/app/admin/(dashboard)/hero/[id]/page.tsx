import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { HeroForm } from "@/components/admin/hero/hero-form";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  const slide = await prisma.heroSlide.findUnique({ where: { id }, include: { image: true, mobileImage: true } });
  if (!slide) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Hero Slide"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Hero Slides", href: "/admin/hero" }, { label: "Edit" }]}
      />
      <HeroForm slide={slide} />
    </div>
  );
}
