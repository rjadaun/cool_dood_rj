import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/queries/settings";
import { getCategories, getSocialLinks } from "@/lib/queries/public";
import { SocialIcon } from "@/components/public/social-icon";
import { ENQUIRY_LABEL } from "@/lib/enquiry";
import { CmsPageIntro } from "@/components/public/cms-page-intro";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "contact",
    "Contact",
    "Enquire about a shoot. Share your idea or contact the studio directly.",
  );
}

export default async function ContactPage() {
  const [settings, categories, socials] = await Promise.all([
    getSettings(),
    getCategories(),
    getSocialLinks(),
  ]);
  const projectTypes = categories.map((c) => c.name);

  return (
    <>
      <CmsPageIntro
        slug="contact"
        label="Contact"
        title={ENQUIRY_LABEL}
        description="Share a little about your idea. We'll take it from there."
      />
      <section className="container-editorial section-space">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-4">
            <h2 className="label text-stone-500">Contact the studio</h2>
            <div className="mt-6 space-y-5 text-sm">
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex break-words items-start gap-3 text-ink hover:text-accent-deep"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <span className="min-w-0 break-all">{settings.email}</span>
                </a>
              )}
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex break-words items-start gap-3 text-ink hover:text-accent-deep"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  {settings.phone}
                </a>
              )}
              {settings.address && (
                <p className="flex break-words items-start gap-3 text-ink">
                  <MapPin className="mt-0.5 h-4 w-4 text-stone-400" />
                  <span className="max-w-[16rem]">{settings.address}</span>
                </p>
              )}
            </div>
            {socials.length > 0 && (
              <nav className="contact-socials" aria-label="Studio social profiles">
                {socials.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">
                    <SocialIcon platform={social.platform} className="h-4 w-4 shrink-0" />
                    <span>{social.platform.charAt(0) + social.platform.slice(1).toLowerCase()}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
          <div className="min-w-0 md:col-span-8">
            <ContactForm projectTypes={projectTypes} />
          </div>
        </div>
      </section>
    </>
  );
}
