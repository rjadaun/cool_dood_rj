import type { PageSection } from "@prisma/client";
import { getRoutePage } from "@/lib/queries/public";
import { PageHero } from "./page-hero";
import { MediaImage } from "@/components/shared/media-image";
import { ButtonLink } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize";

export function PageSections({ sections }: { sections: PageSection[] }) {
  return <>{sections.filter((section) => section.visible).map((section) => (
    <section key={section.id} className="container-editorial border-t border-line py-16 md:py-20">
      <div className="mx-auto max-w-prose">
        {section.heading && <h2 className="mb-6 font-serif text-3xl text-ink md:text-4xl">{section.heading}</h2>}
        {section.body && <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }} />}
        {section.ctaText && section.ctaUrl && <div className="mt-8"><ButtonLink href={section.ctaUrl}>{section.ctaText}</ButtonLink></div>}
      </div>
    </section>
  ))}</>;
}

/** Use the CMS when configured, retaining existing defaults for unconfigured pages. */
export async function CmsPageIntro({ slug, label, title, description }: { slug: string; label: string; title: string; description?: string }) {
  const page = await getRoutePage(slug);
  return <>
    <PageHero label={label} title={page?.heading || title} description={page?.subheading ?? description} />
    {(page?.content || page?.image) && <section className="container-editorial py-16">
      <div className="mx-auto max-w-prose space-y-8">
        {page.image && <div className="relative aspect-[3/2] overflow-hidden"><MediaImage media={page.image} /></div>}
        {page.content && <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />}
      </div>
    </section>}
    <PageSections sections={page?.sections ?? []} />
  </>;
}
