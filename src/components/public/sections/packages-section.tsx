import Link from "next/link";
import { Check } from "lucide-react";
import type { Package, PackageFeature } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

type Pkg = Package & { features: PackageFeature[] };

export function PackagesSection({
  packages,
  showPricing,
}: {
  packages: Pkg[];
  showPricing: boolean;
}) {
  if (packages.length === 0) return null;
  return (
    <section className="container-editorial py-24 md:py-32">
      <SectionHeader
        label="Investment"
        title="Packages for every kind of project."
        description="Transparent starting points, every project is tailored to its brief."
        align="center"
        className="mb-16"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg, i) => (
          <Reveal key={pkg.id} delay={(i % 4) * 0.08}>
            <div
              className={cn(
                "flex h-full flex-col border p-8 transition-colors",
                pkg.featured ? "border-ink bg-ink text-paper" : "border-line bg-white"
              )}
            >
              {pkg.featured && (
                <span className="mb-4 w-fit bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-label text-white">
                  Most popular
                </span>
              )}
              <h3 className={cn("font-serif text-2xl", pkg.featured ? "text-paper" : "text-ink")}>
                {pkg.name}
              </h3>
              <div className="mt-4">
                <span className={cn("font-serif text-3xl", pkg.featured ? "text-paper" : "text-ink")}>
                  {showPricing ? pkg.price : "Request a Quote"}
                </span>
                {showPricing && pkg.priceSuffix && (
                  <span className={cn("ml-1 text-sm", pkg.featured ? "text-paper/60" : "text-stone-400")}>
                    {pkg.priceSuffix}
                  </span>
                )}
              </div>
              {pkg.description && (
                <p className={cn("mt-4 text-sm leading-relaxed", pkg.featured ? "text-paper/70" : "text-stone-500")}>
                  {pkg.description}
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-3">
                {pkg.features.map((f) => (
                  <li key={f.id} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn("mt-0.5 h-4 w-4 shrink-0", pkg.featured ? "text-accent-soft" : "text-accent")}
                    />
                    <span className={pkg.featured ? "text-paper/80" : "text-ink/70"}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.ctaUrl || "/contact"}
                className={cn(
                  "mt-8 inline-flex h-12 items-center justify-center text-[13px] font-medium uppercase tracking-wide transition-colors",
                  pkg.featured
                    ? "bg-paper text-ink hover:bg-white"
                    : "bg-ink text-paper hover:bg-ink-soft"
                )}
              >
                {pkg.ctaText || "Enquire"}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
