import type { Project } from "@/components/public/project-card";
import { ProjectCollection } from "@/components/public/project-collection";
import { SectionHeader } from "./section-header";

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section className="container-editorial section-space">
      <SectionHeader label="Projects" title="Selected stories" />
      <ProjectCollection projects={projects} />
    </section>
  );
}
