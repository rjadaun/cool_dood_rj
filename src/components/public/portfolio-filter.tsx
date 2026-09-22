"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface FilterItem {
  label: string;
  slug: string;
}

export function PortfolioFilter({
  categories,
  active,
}: {
  categories: FilterItem[];
  active: string;
}) {
  const items = [{ label: "All", slug: "all" }, ...categories];
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
      {items.map((item) => {
        const isActive = active === item.slug || (active === "" && item.slug === "all");
        const href = item.slug === "all" ? "/portfolio" : `/portfolio?category=${item.slug}`;
        return (
          <Link
            key={item.slug}
            href={href}
            className={cn(
              "shrink-0 whitespace-nowrap border px-4 py-2 text-[12px] font-medium uppercase tracking-wide transition-colors",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink/60 hover:border-ink hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
