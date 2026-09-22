import { Reveal, MaskReveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {label && (
        <Reveal>
          <p className={cn("label mb-4 inline-flex items-center gap-3", dark ? "text-paper/80" : "text-accent-deep")}>
            <span className={cn("h-px w-10 animate-line-grow", dark ? "bg-paper/50" : "bg-accent")} />
            {label}
          </p>
        </Reveal>
      )}
      <MaskReveal delay={0.05}>
        <h2
          className={cn(
            "font-serif text-display-sm font-light leading-[1.05]",
            dark ? "text-paper" : "text-ink"
          )}
        >
          {title}
        </h2>
      </MaskReveal>
      {description && (
        <Reveal delay={0.15}>
          <p className={cn("mt-5 text-base leading-relaxed", dark ? "text-paper/70" : "text-ink/70")}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
