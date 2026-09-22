import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getServices } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { CtaSection } from "@/components/public/sections/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Services",
    description: "Full-service creative photography, from concept to final frame.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        label="Services"
        title="Full-service creative support."
        description="From a single portrait to a full brand campaign, considered work at every scale."
      />
      <section className="container-editorial py-20 md:py-28">
        <div className="space-y-24 md:space-y-32">
          {services.map((service, i) => (
            <Reveal key={service.id}>
              <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16">
                <div className={`relative aspect-[4/5] overflow-hidden bg-stone-100 md:col-span-5 ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
                  <MediaImage media={service.image} alt={service.name} sizes="(max-width:768px) 100vw, 42vw" />
                </div>
                <div className={`md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                  <span className="font-mono text-sm text-stone-400">{service.number}</span>
                  <h2 className="mt-3 font-serif text-4xl font-light text-ink md:text-5xl">{service.name}</h2>
                  <p className="mt-5 max-w-md leading-relaxed text-ink/70">{service.longDescription || service.shortDescription}</p>
                  {service.features.length > 0 && (
                    <ul className="mt-8 space-y-3">
                      {service.features.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 text-sm text-ink/80">
                          <Check className="h-4 w-4 text-accent" />
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={service.ctaUrl || "/contact"}
                    className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
                  >
                    {service.ctaText || "Enquire"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaSection />
    </>
  );
}
