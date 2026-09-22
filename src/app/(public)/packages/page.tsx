import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPackages } from "@/lib/queries/public";
import { getSettings } from "@/lib/queries/settings";
import { PageHero } from "@/components/public/page-hero";
import { PackagesSection } from "@/components/public/sections/packages-section";
import { CtaSection } from "@/components/public/sections/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Packages",
    description: "Transparent starting points for portrait, editorial and commercial work.",
    path: "/packages",
  });
}

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  return (
    <>
      <PageHero
        label="Investment"
        title="Packages & pricing."
        description="Clear starting points, every project is tailored to its brief."
      />
      <PackagesSection packages={packages} showPricing={settings.showPricingPublic} />
      <CtaSection />
    </>
  );
}
