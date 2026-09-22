"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { publicNav } from "@/config/nav";
import { cn } from "@/lib/utils";

function BrandLogo({ src, className }: { src: string; className?: string }) {
  // Decorative: the site name always sits right next to it.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={cn("h-8 w-auto max-w-[9rem] object-contain", className)} />;
}

export function SiteHeader({ siteName, logoUrl }: { siteName: string; logoUrl?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Home page: transparent over the hero until scrolled.
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-editorial",
          transparent ? "bg-transparent" : "border-b border-line bg-paper/90 backdrop-blur-md"
        )}
      >
        <div className="container-editorial flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2.5 font-serif text-xl font-medium tracking-tight transition-colors md:text-2xl",
              transparent ? "text-white" : "text-ink"
            )}
          >
            {logoUrl && <BrandLogo src={logoUrl} className="md:h-10" />}
            {siteName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {publicNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "link-underline text-[13px] font-medium uppercase tracking-wide transition-colors",
                    transparent ? "text-white/90 hover:text-white" : "text-ink/70 hover:text-ink",
                    active && (transparent ? "text-white" : "text-ink")
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              className={cn(
                "inline-flex h-10 items-center px-5 text-[13px] font-medium uppercase tracking-wide transition-colors",
                transparent
                  ? "bg-white text-ink hover:bg-white/90"
                  : "bg-ink text-paper hover:bg-ink-soft"
              )}
            >
              Work With Me
            </Link>
          </nav>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            className={cn("p-1 md:hidden", transparent ? "text-white" : "text-ink")}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile menu. Kept outside <header>: the header's backdrop-blur would make it the
          containing block for this fixed overlay and clip the menu to the header's height. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col bg-ink text-paper md:hidden"
          >
            <div className="container-editorial flex h-16 items-center justify-between">
              <span className="inline-flex items-center gap-2.5 font-serif text-xl">
                {logoUrl && <BrandLogo src={logoUrl} />}
                {siteName}
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
              {publicNav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link href={item.href} className="block py-3 font-serif text-4xl">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="border-t border-white/10 p-6">
              <Link
                href="/contact"
                className="inline-flex h-12 w-full items-center justify-center bg-paper text-ink"
              >
                Work With Me
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
