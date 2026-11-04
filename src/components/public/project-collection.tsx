import type { CSSProperties } from "react";
import { ProjectCard, type Project } from "./project-card";
import { imageRatio, imageRows } from "@/lib/gallery/layout";

export function ProjectCollection({
  projects,
  priority = false,
}: {
  projects: Project[];
  priority?: boolean;
}) {
  const rows = imageRows(
    projects,
    (project) => imageRatio(project.cover),
    "MIXED",
  );
  return (
    <div className="project-collection">
      {rows.map((row) => (
        <div
          key={row[0]!.id}
          className="photo-row"
          data-single={row.length === 1}
          style={
            {
              "--columns": row.map((p) => `${imageRatio(p.cover)}fr`).join(" "),
              "--single-width":
                imageRatio(row[0]!.cover) < 1 ? "680px" : "100%",
            } as CSSProperties
          }
        >
          {row.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              sizes={
                row.length === 1
                  ? "(max-width: 640px) 100vw, 90vw"
                  : row.length === 3
                  ? "(max-width: 640px) 100vw, 40vw"
                  : "(max-width: 640px) 100vw, 60vw"
              }
              priority={priority && projects.indexOf(project) < 3}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
