import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPageBySlug, getStats, getAwards, getClients } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { StatsSection } from "@/components/public/sections/stats-section";
import { AwardsSection } from "@/components/public/sections/awards-section";
import { ClientsSection } from "@/components/public/sections/clients-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return buildMetadata({
    title: page?.seoTitle || "About",
    description: page?.seoDescription || page?.subheading,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [page, stats, awards, clients] = await Promise.all([
    getPageBySlug("about"),
    getStats(),
    getAwards(),
    getClients(),
  ]);

  return (
    <>
      <div>Test message</div>
      <PageHero
        label="About the Studio"
        title={page?.heading || "Photography with a refined eye."}
        description={page?.subheading}
      />
      {(page?.content || page?.image) && (
        <section className="container-editorial py-20 md:py-24">
          {page?.image?.url ? (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
              <Reveal className="md:col-span-5">
                <figure className="relative aspect-[4/5] overflow-hidden bg-stone-100 md:sticky md:top-28">
                  <MediaImage
                    media={page.image}
                    alt={page.heading || "The photographer"}
                    sizes="(max-width:768px) 100vw, 40vw"
                    className="transition-transform duration-[1200ms] ease-editorial hover:scale-[1.03]"
                  />
                </figure>
              </Reveal>
              <div className="md:col-span-6 md:col-start-7">
                {page?.content && (
                  <Reveal delay={0.1}>
                    <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: page.content }} />
                  </Reveal>
                )}
              </div>
            </div>
          ) : (
            page?.content && (
              <div className="prose-editorial mx-auto" dangerouslySetInnerHTML={{ __html: page.content }} />
            )
          )}
        </section>
      )}
      <StatsSection stats={stats} />
      <ClientsSection clients={clients} />
      <AwardsSection awards={awards} />
    </>
  );
}
