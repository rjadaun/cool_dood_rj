import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Media, Service, ServiceFeature } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";

type Svc = Service & { image: Media | null; features: ServiceFeature[] };

export function ServicesSection({ services }: { services: Svc[] }) {
  if (services.length === 0) return null;
  return (
    <section className="container-editorial py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader label="Services" title="Full-service creative support." />
        <Reveal>
          <Link
            href="/services"
            className="link-underline inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
          >
            All services <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 border-t border-line">
        {services.slice(0, 8).map((service, i) => (
          <Reveal key={service.id} delay={(i % 4) * 0.05}>
            <Link
              href={service.ctaUrl || "/services"}
              className="group grid grid-cols-12 items-center gap-4 border-b border-line py-7 transition-colors hover:bg-paper-dim/40"
            >
              <span className="col-span-2 font-mono text-sm text-stone-400 md:col-span-1">
                {service.number || String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="col-span-10 font-serif text-2xl text-ink md:col-span-4 md:text-3xl">
                {service.name}
              </h3>
              <p className="col-span-12 text-sm text-stone-500 md:col-span-6 md:col-start-7 md:pr-10">
                {service.shortDescription}
              </p>
              <ArrowRight className="col-span-1 hidden h-5 w-5 justify-self-end text-stone-300 transition-all group-hover:translate-x-1 group-hover:text-ink md:block" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
