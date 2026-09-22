import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Media } from "@prisma/client";
import { Reveal, MaskReveal } from "@/components/shared/reveal";
import { MediaImage } from "@/components/shared/media-image";

interface IntroSectionProps {
  label?: string | null;
  heading?: string | null;
  content?: string | null; // sanitized HTML
  image?: Media | null;
}

export function IntroSection({ label, heading, content, image }: IntroSectionProps) {
  const hasImage = !!image?.url;

  const body = (
    <>
      {/* Big serif headline — same style as the hero slide */}
      <MaskReveal>
        <h2 className="font-serif text-display-sm font-light leading-[1.02] text-ink md:text-display">
          {label || "About the Photographer"}
        </h2>
      </MaskReveal>

      {/* Secondary serif line */}
      {heading ? (
        <Reveal delay={0.08}>
          <p className="mt-4 font-serif text-2xl font-light leading-snug text-ink/70 md:text-3xl">
            {heading}
          </p>
        </Reveal>
      ) : null}

      {content ? (
        <Reveal delay={0.12}>
          <div className="prose-editorial mt-6 text-ink/75" dangerouslySetInnerHTML={{ __html: content }} />
        </Reveal>
      ) : null}

      <Reveal delay={0.16}>
        <Link
          href="/about"
          className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink"
        >
          More about the studio <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </>
  );

  return (
    <section className="container-editorial py-20 md:py-28">
      {hasImage ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start md:gap-16">
          <Reveal className="md:col-span-5">
            <figure className="relative aspect-[4/5] overflow-hidden bg-stone-100">
              <MediaImage
                media={image}
                alt={label || "Photographer portrait"}
                sizes="(max-width:768px) 100vw, 40vw"
                className="transition-transform duration-[1200ms] ease-editorial hover:scale-[1.03]"
              />
            </figure>
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">{body}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">{body}</div>
      )}
    </section>
  );
}
