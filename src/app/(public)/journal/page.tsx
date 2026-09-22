import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/queries/public";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/public/page-hero";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { EmptyState } from "@/components/ui/misc";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Journal",
    description: "Notes on photography, process and the craft behind the images.",
    path: "/journal",
  });
}

export default async function JournalPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <PageHero label="Journal" title="Notes from the studio." />
      <section className="container-editorial py-16 md:py-20">
        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title="No articles yet" description="Check back soon for studio notes." />
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.06}>
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                    <MediaImage
                      media={post.cover}
                      alt={post.title}
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-5">
                    <p className="label text-stone-500">
                      {post.category}
                      {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-ink">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-stone-500">{post.excerpt}</p>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
