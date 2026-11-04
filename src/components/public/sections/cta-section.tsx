import Link from "next/link";

export function CtaSection({
  heading,
  body,
  ctaText,
  ctaUrl,
}: {
  heading?: string | null;
  body?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}) {
  return (
    <section className="contact-band">
      <div className="container-editorial contact-band-inner">
        <div>
          <p className="section-label">Commissions & collaborations</p>
          <h2>{heading || "Let's make something meaningful."}</h2>
          {body && <p className="contact-band-description">{body}</p>}
        </div>
        <div className="contact-band-links">
          <Link href={ctaUrl || "/contact"} className="public-button">
            {ctaText || "Get in touch"}
          </Link>
          <Link href="/portfolio" className="text-link">
            View portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
