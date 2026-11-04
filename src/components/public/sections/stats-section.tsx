import type { Stat } from "@prisma/client";
export function StatsSection({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section className="container-editorial stats-section">
      <dl className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id}>
            <dd>{stat.value}</dd>
            <dt>{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
