import type { Metadata } from "next";
import { Star } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getTestimonials } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { CtaSection } from "@/components/public/sections/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Testimonials",
    description: "What clients say about working with the studio.",
    path: "/testimonials",
  });
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHero label="Testimonials" title="In their words." />
      <section className="container-editorial py-20 md:py-24">
        <div className="columns-1 gap-8 md:columns-2 lg:columns-2 [&>*]:mb-8 [&>*]:break-inside-avoid">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 2) * 0.06}>
              <figure className="border border-line bg-white p-8 md:p-10">
                {t.rating ? (
                  <div className="mb-5 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                ) : null}
                <blockquote className="font-serif text-xl font-light leading-relaxed text-ink md:text-2xl">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  {t.image && (
                    <div className="relative h-11 w-11 overflow-hidden rounded-full">
                      <MediaImage media={t.image} alt={t.name} sizes="44px" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-ink">{t.name}</div>
                    <div className="text-xs text-stone-500">{[t.role, t.company].filter(Boolean).join(", ")}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaSection />
    </>
  );
}
