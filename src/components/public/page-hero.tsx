interface PageHeroProps {
  label?: string;
  title: string;
  description?: string | null;
}

export function PageHero({ label, title, description }: PageHeroProps) {
  return (
    <section className="page-intro container-editorial">
      {label && <p className="page-label">{label}</p>}
      <div className="page-intro-grid">
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
    </section>
  );
}
