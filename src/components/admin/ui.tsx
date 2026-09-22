import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/misc";

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "flex items-start justify-between rounded-lg border p-5 transition-colors",
        accent ? "border-ink bg-ink text-paper" : "border-stone-200 bg-white hover:border-stone-300"
      )}
    >
      <div>
        <p className={cn("text-xs font-medium uppercase tracking-wide", accent ? "text-paper/60" : "text-stone-400")}>
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </div>
      <Icon className={cn("h-5 w-5", accent ? "text-paper/50" : "text-stone-300")} />
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function AdminCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-stone-200 bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn(title ? "p-5" : "")}>{children}</div>
    </div>
  );
}
