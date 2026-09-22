import { Reveal } from "@/components/shared/reveal";

interface PageHeroProps {
  label?: string;
  title: string;
  description?: string | null;
}

/** Consistent editorial header band for inner public pages. */
export function PageHero({ label, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-line pt-32 md:pt-40">
      <div className="container-editorial pb-16 md:pb-20">
        {label && (
          <Reveal>
            <p className="label inline-flex items-center gap-3 text-accent-deep">
              <span className="h-px w-10 bg-accent" />
              {label}
            </p>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className="mt-4 max-w-4xl font-serif text-display-lg font-light leading-[0.98] text-ink">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">{description}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
