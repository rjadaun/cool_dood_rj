import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import {
  getRoutePage,
  getStats,
  getAwards,
  getClients,
  getSelectedProjects,
} from "@/lib/queries/public";
import { getSettings } from "@/lib/queries/settings";
import { MediaImage } from "@/components/shared/media-image";
import { ENQUIRY_LABEL, enquiryLabel } from "@/lib/enquiry";
import { sanitizeHtml } from "@/lib/sanitize";
import styles from "./about.module.css";

export const dynamic = "force-dynamic";

// Only replace the original seed defaults; authored CMS content always wins.
const starterContent =
  "<p>Rjadaun is a creative practice working across fashion, beauty and commercial photography.</p><h2>A considered approach</h2><p>Every project begins with a reference and a question: what feeling should the final image carry? Replace this content from the admin panel.</p>";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getRoutePage("about");
  return buildMetadata({
    title: page?.seoTitle || "About",
    description: page?.seoDescription || page?.subheading,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [page, stats, awards, clients, projects, settings] = await Promise.all([
    getRoutePage("about"),
    getStats(),
    getAwards(),
    getClients(),
    getSelectedProjects(),
    getSettings(),
  ]);
  const portrait =
    page?.image?.key === "seed/about-photographer-1200x1500"
      ? null
      : page?.image;
  const portfolio = projects.filter(
    (project) => project.cover && project.cover.id !== portrait?.id,
  );
  const leadProject = portrait ? null : portfolio[0];
  const leadImage = portrait || leadProject?.cover;
  const supportingProject = portfolio.find(
    (project) => project.cover?.id !== leadImage?.id,
  );
  const title =
    page?.heading && page.heading !== "Photography with a refined eye."
      ? page.heading
      : "Behind the photographs.";
  const intro =
    page?.subheading &&
    page.subheading !==
      "A creative studio working across fashion, beauty and commercial photography."
      ? page.subheading
      : "Fashion, beauty and commercial photography. A practice built around light, expression and detail.";
  const biography =
    page?.content?.trim() === starterContent ? null : page?.content;

  return (
    <article className={styles.page}>
      <div
        className={`container-editorial ${styles.profile}`}
        data-has-image={!!leadImage}
      >
        <header className={styles.introduction}>
          <p className={styles.identity}>
            About <span>{settings.siteName}</span>
          </p>
          <h1>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          {settings.address && (
            <p className={styles.location}>{settings.address}</p>
          )}
          <div className={styles.actions}>
            <Link href="/contact" className={styles.primaryLink}>
              {ENQUIRY_LABEL}
            </Link>
            <Link href="/portfolio" className={styles.quietLink}>
              Explore the work
            </Link>
          </div>
        </header>

        {leadImage && (
          <figure className={styles.leadFigure}>
            <MediaImage
              media={leadImage}
              fill={false}
              priority
              alt={
                leadImage.altText ||
                (portrait
                  ? `${settings.siteName}, photographer`
                  : leadProject?.title) ||
                "Selected photography"
              }
              sizes="(max-width: 767px) 100vw, 45vw"
              className={styles.photograph}
            />
            <figcaption className={styles.caption}>
              <span>
                {portrait
                  ? portrait.caption || settings.siteName
                  : "From the portfolio"}
              </span>
              {leadProject && (
                <Link href={`/portfolio/${leadProject.slug}`}>
                  {leadProject.title}
                </Link>
              )}
            </figcaption>
          </figure>
        )}

        {supportingProject?.cover && (
          <figure className={styles.supportingFigure}>
            <Link
              href={`/portfolio/${supportingProject.slug}`}
              aria-label={`View ${supportingProject.title}`}
            >
              <MediaImage
                media={supportingProject.cover}
                fill={false}
                alt={supportingProject.cover.altText || supportingProject.title}
                sizes="(max-width: 767px) 70vw, 26vw"
                className={styles.photograph}
              />
            </Link>
            <figcaption className={styles.caption}>
              <Link href={`/portfolio/${supportingProject.slug}`}>
                {supportingProject.title}
              </Link>
            </figcaption>
          </figure>
        )}

        <section
          className={styles.biography}
          aria-label="About the photographer"
        >
          {biography ? (
            <div
              className={`prose-editorial ${styles.biographyCopy}`}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(biography) }}
            />
          ) : (
            <div className={`prose-editorial ${styles.biographyCopy}`}>
              <p>
                {settings.siteName} is a photography practice working across
                fashion, beauty and commercial imagery.
              </p>
              <h2>A considered approach</h2>
              <p>
                Every project begins with a reference and a question: what
                feeling should the final image carry?
              </p>
              <p>
                Light, expression and the details around a subject shape the
                answer. Explore the portfolio for a closer look at the work, or
                get in touch to discuss a shoot.
              </p>
            </div>
          )}
          {stats.length > 0 && (
            <dl className={styles.experience}>
              {stats.map((stat) => (
                <div key={stat.id}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      {page?.sections.map((section) => (
        <section
          className={`container-editorial ${styles.storySection}`}
          key={section.id}
        >
          {section.heading && <h2>{section.heading}</h2>}
          <div className={styles.storyBody}>
            {section.body && (
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
              />
            )}
            {section.ctaText && section.ctaUrl && (
              <Link href={section.ctaUrl} className={styles.quietLink}>
                {enquiryLabel(section.ctaUrl, section.ctaText)}
              </Link>
            )}
          </div>
        </section>
      ))}

      {(clients.length > 0 || awards.length > 0) && (
        <div className={`container-editorial ${styles.credentials}`}>
          {clients.length > 0 && (
            <section className={styles.clients} aria-labelledby="about-clients">
              <h2 id="about-clients">In good company.</h2>
              <p className={styles.sectionNote}>
                Selected clients & collaborators
              </p>
              <ul className={styles.clientList}>
                {clients.map((client) => (
                  <li key={client.id}>
                    {client.logo &&
                    !client.logo.url.startsWith(
                      "https://picsum.photos/seed/client-",
                    ) ? (
                      <div className={styles.clientLogo}>
                        <MediaImage
                          media={client.logo}
                          alt={client.name}
                          sizes="120px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <span>{client.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {awards.length > 0 && (
            <section
              className={styles.recognition}
              aria-labelledby="about-recognition"
            >
              <h2 id="about-recognition">Recognition</h2>
              <ul className={styles.awardList}>
                {awards.map((award) => (
                  <li key={award.id}>
                    {award.year && (
                      <span className={styles.awardYear}>{award.year}</span>
                    )}
                    <div>
                      <h3>{award.name}</h3>
                      {award.description && <p>{award.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <section
        className={`container-editorial ${styles.contact}`}
        aria-labelledby="about-contact"
      >
        <h2 id="about-contact">
          Have something
          <br />
          in mind?
        </h2>
        <div>
          <p>Tell me about the photographs you want to make.</p>
          <Link href="/contact" className={styles.primaryLink}>
            {ENQUIRY_LABEL}
          </Link>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className={styles.email}>
              {settings.email}
            </a>
          )}
        </div>
      </section>
    </article>
  );
}
