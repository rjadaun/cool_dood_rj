"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { publicNav } from "@/config/nav";

export function SiteHeader({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const menu = React.useRef<HTMLDialogElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  React.useEffect(() => {
    if (!open || !menu.current) return;
    const element = menu.current;
    const previous = trigger.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    const breakpoint = window.matchMedia("(min-width: 1100px)");
    const resize = () => {
      if (breakpoint.matches) setOpen(false);
    };
    breakpoint.addEventListener("change", resize);
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      breakpoint.removeEventListener("change", resize);
      previous?.focus({ preventScroll: true });
    };
  }, [open]);
  const brand = (
    <>
      {/* CMS logos can be SVGs or remote assets with unknown dimensions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logoUrl && <img src={logoUrl} alt="" className="brand-logo" />}
      <span className="brand-name">{siteName}</span>
    </>
  );
  const links = publicNav.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={item.href === "/contact" ? "nav-contact" : undefined}
      onClick={() => setOpen(false)}
      aria-current={
        pathname === item.href || pathname.startsWith(item.href + "/")
          ? "page"
          : undefined
      }
    >
      {item.label}
    </Link>
  ));
  return (
    <>
      <header
        className="site-header"
        data-overlay={pathname === "/" && !scrolled}
      >
        <div className="container-editorial header-inner">
          <Link href="/" className="site-brand" aria-label={`${siteName} home`}>
            {brand}
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links}
          </nav>
          <button
            ref={trigger}
            type="button"
            className="menu-trigger"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            Menu <Menu size={20} />
          </button>
        </div>
      </header>
      <dialog
        ref={menu}
        id="site-menu"
        className="site-menu"
        aria-label="Main navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <div className="mobile-menu-inner">
          <div className="mobile-menu-top">
            <Link href="/" className="site-brand" onClick={() => setOpen(false)}>
              {brand}
            </Link>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={26} />
            </button>
          </div>
          <nav aria-label="Mobile navigation">{links}</nav>
          <p>Photography by {siteName}</p>
        </div>
      </dialog>
    </>
  );
}
