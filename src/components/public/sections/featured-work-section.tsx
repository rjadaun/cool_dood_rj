import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Media, PortfolioProject } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { ProjectCard } from "@/components/public/project-card";
import { SectionHeader } from "./section-header";

type Project = PortfolioProject & { cover: Media | null; category: Category | null };

/** Asymmetric editorial layout — deliberately not an equal-column grid. */
export function FeaturedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  const [a, b, c, d, e] = projects;

  return (
    <section className="container-editorial py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader label="Selected · Featured" title="Work worth pausing on." />
        <Reveal>
          <Link
            href="/portfolio"
            className="link-underline inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
          >
            View all work <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-12">
        {/* Row 1 — large + portrait */}
        {a && (
          <Reveal className="md:col-span-7" delay={0}>
            <ProjectCard project={a} aspect="aspect-[16/11]" priority sizes="(max-width:768px) 100vw, 58vw" />
          </Reveal>
        )}
        {b && (
          <Reveal className="md:col-span-5 md:mt-16" delay={0.08}>
            <ProjectCard project={b} aspect="aspect-[4/5]" sizes="(max-width:768px) 100vw, 42vw" />
          </Reveal>
        )}
        {/* Row 2 — portrait + portrait + portrait */}
        {c && (
          <Reveal className="md:col-span-4" delay={0}>
            <ProjectCard project={c} aspect="aspect-[3/4]" sizes="(max-width:768px) 100vw, 33vw" />
          </Reveal>
        )}
        {d && (
          <Reveal className="md:col-span-4 md:mt-12" delay={0.08}>
            <ProjectCard project={d} aspect="aspect-[3/4]" sizes="(max-width:768px) 100vw, 33vw" />
          </Reveal>
        )}
        {e && (
          <Reveal className="md:col-span-4" delay={0.16}>
            <ProjectCard project={e} aspect="aspect-[3/4]" sizes="(max-width:768px) 100vw, 33vw" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
