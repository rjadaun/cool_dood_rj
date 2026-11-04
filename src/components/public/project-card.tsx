import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Media, PortfolioProject } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { imageRatio } from "@/lib/gallery/layout";
import { cn } from "@/lib/utils";

export type Project = PortfolioProject & {
  cover: Media | null;
  category: Category | null;
};

export function ProjectCard({
  project,
  priority = false,
  sizes = "(max-width: 640px) 100vw, 50vw",
  className,
}: {
  project: Project;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={cn("project-card group block min-w-0", className)}
    >
      <div
        className="project-image relative overflow-hidden bg-stone-100"
        style={{ aspectRatio: imageRatio(project.cover) }}
      >
        <MediaImage
          media={project.cover}
          alt={project.cover?.altText || project.title}
          priority={priority}
          sizes={sizes}
          className="object-contain"
        />
        <span className="project-open" aria-hidden>
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="project-caption">
        <div className="min-w-0">
          <h3>{project.title}</h3>
          <p>
            {[project.category?.name, project.location]
              .filter(Boolean)
              .join(" / ")}
          </p>
        </div>
        {project.year && <span className="project-year">{project.year}</span>}
      </div>
    </Link>
  );
}
