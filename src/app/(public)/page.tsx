import { getSettings } from "@/lib/queries/settings";
import {
  getHeroSlides,
  getHomeSections,
  getStats,
  getCategories,
  getFeaturedProjects,
  getSelectedProjects,
  getServices,
  getClients,
  getTestimonials,
  getAwards,
  getPackages,
  getSocialLinks,
  getPageBySlug,
} from "@/lib/queries/public";
import { HeroSlider } from "@/components/public/hero/hero-slider";
import { IntroSection } from "@/components/public/sections/intro-section";
import { StatsSection } from "@/components/public/sections/stats-section";
import { CategoriesSection } from "@/components/public/sections/categories-section";
import { FeaturedWorkSection } from "@/components/public/sections/featured-work-section";
import { ProcessSection } from "@/components/public/sections/process-section";
import { ServicesSection } from "@/components/public/sections/services-section";
import { SelectedWorkSection } from "@/components/public/sections/selected-work-section";
import { ClientsSection } from "@/components/public/sections/clients-section";
import { TestimonialsSection } from "@/components/public/sections/testimonials-section";
import { AwardsSection } from "@/components/public/sections/awards-section";
import { PackagesSection } from "@/components/public/sections/packages-section";
import { SocialSection } from "@/components/public/sections/social-section";
import { NewsletterSection } from "@/components/public/sections/newsletter-section";
import { CtaSection } from "@/components/public/sections/cta-section";

// DB-backed; render per request (queries are individually cached with tags).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    settings,
    slides,
    sections,
    stats,
    categories,
    featured,
    selected,
    services,
    clients,
    testimonials,
    awards,
    packages,
    socials,
    home,
  ] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getHomeSections(),
    getStats(),
    getCategories(),
    getFeaturedProjects(),
    getSelectedProjects(),
    getServices(),
    getClients(),
    getTestimonials(),
    getAwards(),
    getPackages(),
    getSocialLinks(),
    getPageBySlug("home"),
  ]);

  const processSteps = home?.sections.filter((s) => s.key === "process") ?? [];
  const cta = home?.sections.find((s) => s.key === "cta");

  const visible = sections.filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  // Fallback order if HomeSection table is empty.
  const order = visible.length
    ? visible.map((s) => s.key)
    : ([
        "HERO", "ABOUT", "STATS", "CATEGORIES", "FEATURED_WORK", "PROCESS", "SERVICES",
        "SELECTED_WORK", "CLIENTS", "TESTIMONIALS", "AWARDS", "PACKAGES", "SOCIAL",
        "NEWSLETTER", "CTA",
      ] as const);

  const render: Record<string, React.ReactNode> = {
    HERO: <HeroSlider key="hero" slides={slides} />,
    ABOUT: <IntroSection key="about" label={home?.subheading} heading={home?.heading} content={home?.content} image={home?.image} />,
    STATS: <StatsSection key="stats" stats={stats} />,
    CATEGORIES: <CategoriesSection key="categories" categories={categories} />,
    FEATURED_WORK: <FeaturedWorkSection key="featured" projects={featured} />,
    PROCESS: <ProcessSection key="process" steps={processSteps} />,
    SERVICES: <ServicesSection key="services" services={services} />,
    SELECTED_WORK: <SelectedWorkSection key="selected" projects={selected} />,
    CLIENTS: <ClientsSection key="clients" clients={clients} />,
    TESTIMONIALS: <TestimonialsSection key="testimonials" testimonials={testimonials} />,
    AWARDS: <AwardsSection key="awards" awards={awards} />,
    PACKAGES: settings.showPricingPublic || packages.length ? (
      <PackagesSection key="packages" packages={packages} showPricing={settings.showPricingPublic} />
    ) : null,
    SOCIAL: <SocialSection key="social" socials={socials} />,
    NEWSLETTER: settings.newsletterEnabled ? <NewsletterSection key="newsletter" /> : null,
    CTA: <CtaSection key="cta" heading={cta?.heading} body={cta?.body} ctaText={cta?.ctaText} ctaUrl={cta?.ctaUrl} />,
  };

  return <>{order.map((key) => render[key])}</>;
}
