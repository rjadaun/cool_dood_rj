import Link from "next/link";
import type { Project } from "@/components/public/project-card";
import { ProjectCollection } from "@/components/public/project-collection";
import { SectionHeader } from "./section-header";

export function FeaturedWorkSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="container-editorial section-space">
      <div className="section-heading-row">
        <SectionHeader label="Portfolio" title="Featured work" />
        <Link href="/portfolio" className="text-link">
          Explore all work
        </Link>
      </div>
      <ProjectCollection projects={projects} />
    </section>
  );
}
