import Link from "next/link";
import type { Category, Media } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";

type Cat = Category & { cover: Media | null; _count: { projects: number } };

export function CategoriesSection({ categories }: { categories: Cat[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="container-editorial py-24 md:py-28">
      <SectionHeader label="Disciplines" title="A range of photographic practice." />
      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delay={(i % 6) * 0.06}>
            <Link href={`/portfolio?category=${cat.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <MediaImage
                  media={cat.cover}
                  alt={cat.name}
                  sizes="(max-width:768px) 45vw, 16vw"
                  className="transition-transform duration-700 ease-editorial group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/10 transition-colors group-hover:bg-ink/25" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-serif text-lg text-ink">{cat.name}</span>
                <span className="text-xs text-stone-400">{cat._count.projects}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
