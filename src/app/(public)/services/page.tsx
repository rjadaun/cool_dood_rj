import { enquiryLabel } from "@/lib/enquiry";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { getServices } from "@/lib/queries/public";
import { CmsPageIntro } from "@/components/public/cms-page-intro";
import { MediaImage } from "@/components/shared/media-image";
import { CtaSection } from "@/components/public/sections/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "services",
    "Services",
    "Full-service creative photography, from concept to final frame.",
  );
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <CmsPageIntro
        slug="services"
        label="Services"
        title="Full-service creative support."
        description="From a single portrait to a full brand campaign, considered work at every scale."
      />
      <section className="container-editorial section-space service-list">
        {services.map((service) => (
          <article
            key={service.id}
            className={`service-item ${service.image ? "has-image" : ""}`}
          >
            {service.image && (
              <figure className="service-photograph">
                <MediaImage
                  media={service.image}
                  fill={false}
                  alt={service.image.altText || service.name}
                  sizes="(max-width: 767px) 100vw, 40vw"
                />
              </figure>
            )}
            <div className="service-copy">
              <h2>{service.name}</h2>
              <p>{service.longDescription || service.shortDescription}</p>
              {service.features.length > 0 && (
                <ul>
                  {service.features.map((feature) => (
                    <li key={feature.id}>
                      <Check size={15} aria-hidden />
                      {feature.label}
                    </li>
                  ))}
                </ul>
              )}
              <Link href={service.ctaUrl || "/contact"} className="text-link">
                {enquiryLabel(service.ctaUrl || "/contact", service.ctaText)}
                <ArrowRight size={16} className="ml-3" />
              </Link>
            </div>
          </article>
        ))}
      </section>
      <CtaSection />
    </>
  );
}
