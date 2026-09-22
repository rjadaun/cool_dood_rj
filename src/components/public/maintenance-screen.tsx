import type { SiteSetting } from "@prisma/client";

/** Full-screen holding page shown to public visitors while maintenance mode is on. */
export function MaintenanceScreen({ settings }: { settings: SiteSetting }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-soft">
        {settings.siteName}
      </p>
      <h1 className="mt-8 max-w-3xl font-serif text-display-sm font-light leading-[1.05] md:text-display">
        We're making things better.
      </h1>
      <p className="mt-6 max-w-md text-paper/70">
        The site is briefly down for maintenance and will be back shortly.
        {settings.tagline ? ` ${settings.tagline}.` : ""}
      </p>
      {(settings.contactEmail || settings.email) && (
        <a
          href={`mailto:${settings.contactEmail || settings.email}`}
          className="mt-10 inline-flex h-12 items-center border border-paper/30 px-7 text-[13px] font-medium uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
        >
          Get in touch
        </a>
      )}
    </div>
  );
}
