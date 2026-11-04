import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getPackages } from "@/lib/queries/public";
import { getSettings } from "@/lib/queries/settings";
import { CmsPageIntro } from "@/components/public/cms-page-intro";
import { PackagesSection } from "@/components/public/sections/packages-section";
import { CtaSection } from "@/components/public/sections/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "packages",
    "Packages",
    "Transparent starting points for portrait, editorial and commercial work.",
  );
}

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([
    getPackages(),
    getSettings(),
  ]);
  return (
    <>
      <CmsPageIntro
        slug="packages"
        label="Investment"
        title="Packages & pricing."
        description="Clear starting points, every project is tailored to its brief."
      />
      <PackagesSection
        showHeader={false}
        packages={packages}
        showPricing={settings.showPricingPublic}
      />
      <CtaSection />
    </>
  );
}
