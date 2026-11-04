import Link from "next/link";
import type { Package, PackageFeature } from "@prisma/client";
import { SectionHeader } from "./section-header";

type Pkg = Package & { features: PackageFeature[] };
export function PackagesSection({
  packages,
  showPricing,
  showHeader = true,
}: {
  packages: Pkg[];
  showPricing: boolean;
  showHeader?: boolean;
}) {
  if (!packages.length) return null;
  const highlightFeatured = packages.some((pkg) => !pkg.featured);
  return (
    <section className="container-editorial section-space">
      {showHeader && (
        <SectionHeader
          label="Working together"
          title="Photography commissions"
          description="Starting points for your next shoot. Each project is tailored to its brief."
        />
      )}
      <div
        className={`packages-grid ${showHeader ? "packages-with-heading" : ""}`}
      >
        {packages.map((pkg) => (
          <article key={pkg.id} className="package-item">
            <div className="package-title">
              <h3>{pkg.name}</h3>
              {pkg.featured && highlightFeatured && <span>Featured</span>}
            </div>
            {pkg.description && (
              <p className="package-description">{pkg.description}</p>
            )}
            <p className="package-price">
              {showPricing ? pkg.price : "Request a quote"}
              {showPricing && pkg.priceSuffix && <span>{pkg.priceSuffix}</span>}
            </p>
            <ul>
              {pkg.features.map((feature) => (
                <li key={feature.id}>{feature.label}</li>
              ))}
            </ul>
            <Link href={pkg.ctaUrl || "/contact"} className="text-link">
              {pkg.ctaText || "Enquire about this shoot"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
