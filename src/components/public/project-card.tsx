"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Category, Media, PortfolioProject } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { cn } from "@/lib/utils";

type Project = PortfolioProject & { cover: Media | null; category: Category | null };

interface ProjectCardProps {
  project: Project;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProjectCard({
  project,
  aspect = "aspect-[4/5]",
  priority = false,
  sizes = "(max-width:768px) 100vw, 40vw",
  className,
}: ProjectCardProps) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle vertical parallax of the image within its (overflow-hidden) frame.
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <Link ref={ref} href={`/portfolio/${project.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden bg-stone-100", aspect)}>
        {/* Parallax image layer */}
        <motion.div className="absolute inset-x-0 top-[-10%] h-[120%]" style={reduce ? undefined : { y }}>
          <MediaImage
            media={project.cover}
            alt={project.title}
            priority={priority}
            sizes={sizes}
            className="transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.05]"
          />
        </motion.div>

        {/* Curtain reveal — an overlay that wipes upward the first time the card enters view */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute inset-0 z-[2] origin-top bg-paper-dim"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: inView ? 0 : 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        <div className="absolute inset-0 z-[1] bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
        <div className="absolute right-4 top-4 z-[3] flex h-10 w-10 translate-y-2 items-center justify-center bg-paper text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl text-ink">{project.title}</h3>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-label text-stone-500">
            {project.category?.name}
            {project.location ? ` · ${project.location}` : ""}
          </p>
        </div>
        {project.year && <span className="text-sm text-stone-400">{project.year}</span>}
      </div>
    </Link>
  );
}
