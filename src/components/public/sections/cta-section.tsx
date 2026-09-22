import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

interface CtaSectionProps {
  heading?: string | null;
  body?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}

export function CtaSection({ heading, body, ctaText, ctaUrl }: CtaSectionProps) {
  return (
    <section className="bg-ink text-paper">
      <div className="container-editorial py-28 text-center md:py-40">
        <Reveal>
          <p className="label mb-6 text-paper/50">Have a project in mind?</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto max-w-4xl font-serif text-display font-light leading-[1.02]">
            {heading || "Let's create something worth remembering."}
          </h2>
        </Reveal>
        {body && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-paper/70">{body}</p>
          </Reveal>
        )}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaUrl || "/contact"}
              className="group inline-flex h-13 items-center gap-2 bg-paper px-8 py-4 text-[13px] font-medium uppercase tracking-wide text-ink transition-colors hover:bg-white"
            >
              {ctaText || "Get in Touch"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex h-13 items-center gap-2 border border-paper/40 px-8 py-4 text-[13px] font-medium uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
            >
              View Portfolio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
