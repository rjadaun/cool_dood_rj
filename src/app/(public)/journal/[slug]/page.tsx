import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getPostBySlug } from "@/lib/queries/public";
import { formatDate } from "@/lib/utils";
import { MediaImage } from "@/components/shared/media-image";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Article", noIndex: true });
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/journal/${post.slug}`,
    image: post.cover?.url,
    type: "article",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-editorial article-page">
      <Link
        href="/journal"
        className="link-underline inline-flex items-center gap-2 text-[12px] font-medium tracking-normal text-stone-500"
      >
        <ArrowLeft className="h-4 w-4" /> Journal
      </Link>
      <div className="mx-auto mt-8 max-w-3xl text-center">
        <p className="label text-stone-500">
          {post.category}
          {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
        </p>
        <h1 className="mt-4 font-serif text-display-sm font-light leading-[1.05] text-ink md:text-display">
          {post.title}
        </h1>
        {post.author && (
          <p className="mt-4 text-sm text-stone-500">By {post.author}</p>
        )}
      </div>

      {post.cover && (
        <div className="relative mx-auto mt-8 max-w-4xl overflow-hidden">
          <MediaImage
            fill={false}
            media={post.cover}
            alt={post.title}
            priority
            sizes="100vw"
          />
        </div>
      )}

      {post.content && (
        <div
          className="prose-editorial mx-auto mt-8 pb-14"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}
    </article>
  );
}
