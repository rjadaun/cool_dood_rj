import type { Stat } from "@prisma/client";
import { Reveal } from "@/components/shared/reveal";
import { CountUp } from "@/components/shared/count-up";

export function StatsSection({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="border-y border-line bg-paper-dim/40">
      <div className="container-editorial grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-4 md:py-20">
        {stats.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 0.1}>
            <div className="group relative text-center md:text-left">
              <div className="font-serif text-5xl font-light text-ink transition-colors md:text-6xl lg:text-7xl">
                <CountUp value={stat.value} />
              </div>
              <div className="mt-3 flex items-center gap-2 md:mt-4">
                <span className="hidden h-px w-6 bg-accent transition-all duration-500 group-hover:w-10 md:block" />
                <span className="text-[11px] font-medium uppercase tracking-label text-stone-500">
                  {stat.label}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
