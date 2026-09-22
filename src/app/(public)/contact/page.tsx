import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/queries/settings";
import { getCategories } from "@/lib/queries/public";
import { PageHero } from "@/components/public/page-hero";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Contact",
    description: "Start a project with the studio. We respond within two business days.",
    path: "/contact",
  });
}

const BUDGETS = ["Under $1,000", "$1,000 to $2,500", "$2,500 to $5,000", "$5,000 to $10,000", "$10,000+"];

export default async function ContactPage() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const projectTypes = categories.map((c) => c.name);

  return (
    <>
      <PageHero
        label="Contact"
        title="Let's create something worth remembering."
        description="Tell us about your project and we'll be in touch within two business days."
      />
      <section className="container-editorial py-20 md:py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="label text-stone-500">Studio</h2>
            <div className="mt-6 space-y-5 text-sm">
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 text-ink hover:text-accent-deep">
                  <Mail className="mt-0.5 h-4 w-4 text-stone-400" />
                  {settings.email}
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-start gap-3 text-ink hover:text-accent-deep">
                  <Phone className="mt-0.5 h-4 w-4 text-stone-400" />
                  {settings.phone}
                </a>
              )}
              {settings.address && (
                <p className="flex items-start gap-3 text-ink">
                  <MapPin className="mt-0.5 h-4 w-4 text-stone-400" />
                  <span className="max-w-[16rem]">{settings.address}</span>
                </p>
              )}
            </div>
            <p className="mt-10 max-w-xs text-sm leading-relaxed text-stone-500">
              Prefer email? Write directly and we'll pick it up personally, no forms required.
            </p>
          </div>
          <div className="md:col-span-8">
            <ContactForm projectTypes={projectTypes} budgets={BUDGETS} />
          </div>
        </div>
      </section>
    </>
  );
}
