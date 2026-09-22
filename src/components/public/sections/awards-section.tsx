import type { Award, Media } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";

export function AwardsSection({ awards }: { awards: (Award & { logo: Media | null })[] }) {
  if (awards.length === 0) return null;
  return (
    <section className="container-editorial py-24 md:py-28">
      <SectionHeader label="Recognition" title="Awards & press." />
      <div className="mt-14 border-t border-line">
        {awards.map((award, i) => (
          <Reveal key={award.id} delay={(i % 4) * 0.05}>
            <div className="grid grid-cols-12 items-baseline gap-4 border-b border-line py-6">
              <span className="col-span-2 font-mono text-sm text-stone-400 md:col-span-1">
                {award.year}
              </span>
              <h3 className="col-span-10 font-serif text-xl text-ink md:col-span-5">{award.name}</h3>
              <p className="col-span-12 text-sm text-stone-500 md:col-span-6">{award.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
