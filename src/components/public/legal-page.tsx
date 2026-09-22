import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { formatDate } from "@/lib/utils";

export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero label="Legal" title={page.heading || page.title} />
      <section className="container-editorial py-16 md:py-20">
        <div className="prose-editorial mx-auto" dangerouslySetInnerHTML={{ __html: page.content ?? "" }} />
        <p className="mx-auto mt-12 max-w-prose text-xs text-stone-400">
          Last updated {formatDate(page.updatedAt)}.
        </p>
      </section>
    </>
  );
}
