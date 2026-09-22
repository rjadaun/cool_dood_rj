"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Copy, Trash2, Eye, Power } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { FormResult } from "@/lib/actions/helpers";

interface RowActionsProps {
  editHref?: string;
  previewHref?: string;
  onDelete?: () => Promise<FormResult>;
  onDuplicate?: () => Promise<FormResult>;
  onToggle?: () => Promise<FormResult>;
  toggleLabel?: string;
  deleteLabel?: string;
}

export function RowActions({
  editHref,
  previewHref,
  onDelete,
  onDuplicate,
  onToggle,
  toggleLabel = "Toggle status",
  deleteLabel = "this item",
}: RowActionsProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();
  const confirm = useConfirm();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function run(fn: () => Promise<FormResult>, successMsg?: string) {
    setBusy(true);
    setOpen(false);
    try {
      const res = await fn();
      if (res.ok) {
        if (successMsg ?? res.message) toast.success(res.message ?? successMsg);
        router.refresh();
      } else {
        toast.error(res.message ?? "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="flex h-8 w-8 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-ink disabled:opacity-50"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          {editHref && (
            <Link href={editHref} className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-stone-50">
              <Pencil className="h-3.5 w-3.5 text-stone-400" /> Edit
            </Link>
          )}
          {previewHref && (
            <Link href={previewHref} target="_blank" className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-stone-50">
              <Eye className="h-3.5 w-3.5 text-stone-400" /> Preview
            </Link>
          )}
          {onToggle && (
            <button onClick={() => run(onToggle)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink hover:bg-stone-50">
              <Power className="h-3.5 w-3.5 text-stone-400" /> {toggleLabel}
            </button>
          )}
          {onDuplicate && (
            <button onClick={() => run(onDuplicate)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink hover:bg-stone-50">
              <Copy className="h-3.5 w-3.5 text-stone-400" /> Duplicate
            </button>
          )}
          {onDelete && (
            <button
              onClick={async () => {
                setOpen(false);
                const ok = await confirm({
                  title: "Delete",
                  description: `This will permanently delete ${deleteLabel}. This cannot be undone.`,
                  confirmText: "Delete",
                  danger: true,
                });
                if (ok) run(onDelete, "Deleted.");
              }}
              className="flex w-full items-center gap-2.5 border-t border-stone-100 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
