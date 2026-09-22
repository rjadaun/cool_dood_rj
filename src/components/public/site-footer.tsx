import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { footerNav } from "@/config/nav";
import { getSettings } from "@/lib/queries/settings";
import { getSocialLinks } from "@/lib/queries/public";
import { SocialIcon } from "./social-icon";
import { BackToTop } from "./back-to-top";

export async function SiteFooter() {
  const [settings, socials] = await Promise.all([getSettings(), getSocialLinks()]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink text-paper">
      <div className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="font-serif text-3xl font-medium">
              {settings.siteName}
            </Link>
            {settings.tagline && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">{settings.tagline}</p>
            )}
            <div className="mt-8 space-y-1 text-sm text-paper/60">
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="block link-underline w-fit">
                  {settings.email}
                </a>
              )}
              {settings.phone && <p>{settings.phone}</p>}
              {settings.address && <p className="max-w-xs">{settings.address}</p>}
            </div>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-2">
            <h3 className="label text-paper/40">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
              {footerNav.explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="label text-paper/40">More</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
              {footerNav.more.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-3">
            <h3 className="label text-paper/40">Follow</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform.toLowerCase()}
                  className="flex h-10 w-10 items-center justify-center border border-white/15 text-paper/70 transition-colors hover:border-white/50 hover:text-paper"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-paper/50 md:flex-row md:items-center">
          <p>
            © {year} {settings.copyright || settings.siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerNav.legal.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-paper">
                {l.label}
              </Link>
            ))}
            <BackToTop>
              Back to top <ArrowUp className="h-3.5 w-3.5" />
            </BackToTop>
          </div>
        </div>
      </div>
    </footer>
  );
}
