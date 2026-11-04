import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/queries/public";
import { formatDate } from "@/lib/utils";
import { CmsPageIntro } from "@/components/public/cms-page-intro";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { EmptyState } from "@/components/ui/misc";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "journal",
    "Journal",
    "Notes on photography, process and the craft behind the images.",
  );
}

export default async function JournalPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <CmsPageIntro
        slug="journal"
        label="Journal"
        title="Notes from the studio."
      />
      <section className="container-editorial section-space">
        {posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No articles yet"
            description="Check back soon for studio notes."
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.06}>
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="relative overflow-hidden">
                    <MediaImage
                      fill={false}
                      media={post.cover}
                      alt={post.title}
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="mt-5">
                    <p className="label text-stone-500">
                      {post.category}
                      {post.publishedAt
                        ? ` · ${formatDate(post.publishedAt)}`
                        : ""}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-ink">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-stone-500">
                        {post.excerpt}
                      </p>
                    )}
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
