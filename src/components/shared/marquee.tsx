"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Seamless infinite marquee. Duplicates its children and translates via CSS.
 * With reduced motion it renders a static, wrapped row instead.
 */
export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: React.ReactNode;
  speed?: number; // seconds per loop
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={cn("flex flex-wrap items-center justify-center gap-x-12 gap-y-8", className)}>{children}</div>;
  }

  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div
        className="flex w-max [animation:marquee_var(--dur)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--dur": `${speed}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center gap-x-16 pr-16">{children}</div>
        <div className="flex shrink-0 items-center gap-x-16 pr-16" aria-hidden>
          {children}
        </div>
      </div>
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent" />
    </div>
  );
}
