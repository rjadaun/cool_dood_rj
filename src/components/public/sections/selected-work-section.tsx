import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Media, PortfolioProject } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";

type Project = PortfolioProject & { cover: Media | null; category: Category | null };

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="border-t border-line bg-paper-dim/30">
      <div className="container-editorial py-24 md:py-32">
        <SectionHeader label="Selected Work" title="A closer look." align="center" className="mb-16" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 2) * 0.1}>
              <Link href={`/portfolio/${project.slug}`} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                  <MediaImage
                    media={project.cover}
                    alt={project.title}
                    sizes="(max-width:768px) 100vw, 46vw"
                    className="transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-5">
                  <p className="label text-stone-500">{project.category?.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="font-serif text-2xl text-ink md:text-3xl">{project.title}</h3>
                    <span className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors group-hover:text-ink">
                      View Project <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
