import { Reveal } from "@/components/shared/reveal";
import { NewsletterForm } from "@/components/public/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="border-t border-line bg-paper-dim/40">
      <div className="container-editorial grid grid-cols-1 items-center gap-8 py-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <Reveal>
            <p className="label text-stone-500">Newsletter</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-serif text-display-sm font-light leading-[1.05] text-ink">
              New work, quietly delivered.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-md text-sm text-stone-500">
              Occasional notes on new projects and behind-the-scenes work. No noise.
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <Reveal delay={0.15}>
            <NewsletterForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
