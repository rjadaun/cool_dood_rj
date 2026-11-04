import Link from "next/link";
import type { Category, Media } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { SectionHeader } from "./section-header";
import { imageRatio } from "@/lib/gallery/layout";

type Cat = Category & { cover: Media | null; _count: { projects: number } };
export function CategoriesSection({ categories }: { categories: Cat[] }) {
  if (!categories.length) return null;
  return (
    <section className="container-editorial section-space">
      <SectionHeader title="Explore the work" />
      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/portfolio?category=${encodeURIComponent(cat.slug)}`}
            className="category-link"
          >
            <div
              className="category-image"
              style={{ aspectRatio: imageRatio(cat.cover) }}
            >
              <MediaImage
                media={cat.cover}
                alt={cat.cover?.altText || cat.name}
                sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 16vw"
                className="object-contain"
              />
            </div>
            <div className="category-caption">
              <span>{cat.name}</span>
              <span aria-label={`${cat._count.projects} projects`}>
                {cat._count.projects}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
