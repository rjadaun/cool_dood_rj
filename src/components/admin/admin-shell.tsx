"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronLeft } from "lucide-react";
import { adminNav } from "@/config/admin-nav";
import { hasRole } from "@/lib/auth/rbac-shared";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

interface AdminShellProps {
  user: { name?: string | null; email?: string | null; role: string };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const groups = adminNav
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => hasRole(user.role, i.minRole ?? "EDITOR")),
    }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-stone-200 px-5">
        <Link href="/admin" className="font-serif text-lg font-medium text-ink">
          Rjadaun
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-label text-stone-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-ink text-paper"
                          : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-stone-200 p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-paper">
            {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-stone-400">{user.role.replace("_", " ").toLowerCase()}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" title="Log out" className="text-stone-400 hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
        <Link
          href="/"
          target="_blank"
          className="mt-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-stone-400 hover:text-ink"
        >
          <ChevronLeft className="h-3 w-3" /> View website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-stone-200 bg-white lg:block">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-stone-400"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-stone-500 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            target="_blank"
            className="hidden text-xs font-medium text-stone-500 hover:text-ink md:block"
          >
            lumiere.studio ↗
          </Link>
        </header>
        <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
