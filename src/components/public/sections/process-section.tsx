import type { PageSection } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "./section-header";

export function ProcessSection({ steps }: { steps: PageSection[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="bg-ink text-paper">
      <div className="container-editorial py-24 md:py-32">
        <SectionHeader label="How we work" title="A calm, considered process." dark />
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.08}>
              <div className="flex h-full flex-col bg-ink p-8 md:p-10">
                <span className="font-serif text-sm text-accent-soft">{step.heading}</span>
                <p className="mt-6 text-sm leading-relaxed text-paper/70">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
