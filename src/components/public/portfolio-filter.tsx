import Link from "next/link";
import { cn } from "@/lib/utils";

export function PortfolioFilter({
  categories,
  active,
}: {
  categories: { label: string; slug: string }[];
  active: string;
}) {
  return (
    <nav
      className="portfolio-filters"
      aria-label="Filter portfolio by category"
    >
      {[{ label: "All work", slug: "" }, ...categories].map((item) => {
        const selected =
          active === item.slug || (active === "all" && item.slug === "");
        return (
          <Link
            key={item.slug}
            href={
              item.slug
                ? `/portfolio?category=${encodeURIComponent(item.slug)}`
                : "/portfolio"
            }
            aria-current={selected ? "page" : undefined}
            className={cn("portfolio-filter", selected && "is-active")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
