"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { RowActions } from "@/components/admin/row-actions";
import {
  deletePortfolio, duplicatePortfolio, togglePortfolioStatus, togglePortfolioFeatured,
} from "@/lib/actions/portfolio";

export interface PortfolioRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  client: string | null;
  status: string;
  featured: boolean;
  updatedAt: string;
  coverUrl: string | null;
}

export function PortfolioTable({ rows }: { rows: PortfolioRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="hidden grid-cols-12 gap-4 border-b border-stone-200 bg-stone-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400 md:grid">
        <div className="col-span-5">Project</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Client</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      <ul className="divide-y divide-stone-100">
        {rows.map((row) => (
          <li key={row.id} className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center md:gap-4">
            <div className="col-span-5 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-stone-100">
                {row.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.coverUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/portfolio/${row.id}`} className="flex items-center gap-1.5 truncate text-sm font-medium text-ink hover:underline">
                  {row.featured && <Star className="h-3.5 w-3.5 fill-accent text-accent" />}
                  {row.title}
                </Link>
                <p className="truncate text-xs text-stone-400">/{row.slug}</p>
              </div>
            </div>
            <div className="col-span-2 text-sm text-stone-600">{row.category ?? "-"}</div>
            <div className="col-span-2 text-sm text-stone-600">{row.client ?? "-"}</div>
            <div className="col-span-2">
              <StatusBadge status={row.status} />
            </div>
            <div className="col-span-1 flex justify-end">
              <RowActions
                editHref={`/admin/portfolio/${row.id}`}
                previewHref={`/portfolio/${row.slug}`}
                deleteLabel="this project"
                onDelete={() => deletePortfolio(row.id)}
                onDuplicate={() => duplicatePortfolio(row.id)}
                onToggle={() => togglePortfolioStatus(row.id)}
                toggleLabel={row.status === "PUBLISHED" ? "Set to draft" : "Publish"}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
