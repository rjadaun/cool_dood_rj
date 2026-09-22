"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/field";

export function PortfolioToolbar({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  const push = React.useCallback(
    (patch: Record<string, string>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      sp.delete("page");
      router.push(`/admin/portfolio?${sp.toString()}`);
    },
    [params, router]
  );

  // Debounced search.
  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) push({ q });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="h-10 w-full border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-ink"
        />
      </div>
      <Select
        className="sm:w-44"
        value={params.get("category") ?? ""}
        onChange={(e) => push({ category: e.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </Select>
      <Select
        className="sm:w-40"
        value={params.get("status") ?? ""}
        onChange={(e) => push({ status: e.target.value })}
      >
        <option value="">All statuses</option>
        <option value="PUBLISHED">Published</option>
        <option value="DRAFT">Draft</option>
        <option value="ARCHIVED">Archived</option>
      </Select>
      <Select
        className="sm:w-36"
        value={params.get("featured") ?? ""}
        onChange={(e) => push({ featured: e.target.value })}
      >
        <option value="">All</option>
        <option value="1">Featured</option>
      </Select>
    </div>
  );
}
