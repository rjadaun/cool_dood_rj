"use client";

/* eslint-disable @next/next/no-img-element -- Admin previews use original storage URLs. */

import * as React from "react";
import { Loader2, Check, ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/media/shared";
import { useMediaLibrary } from "./use-media-library";
import { LibraryToolbar, LibraryPagination, LibraryError } from "./library-controls";

export type { MediaItem } from "@/lib/media/shared";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (media: MediaItem) => void;
  onSelectMany?: (media: MediaItem[]) => void;
  multiple?: boolean;
  folder?: string;
}

export function MediaPicker({ open, onClose, onSelect, onSelectMany, multiple = false, folder = "uploads" }: MediaPickerProps) {
  const library = useMediaLibrary(open, folder);
  // Retain the objects across page/search changes, not just IDs from the current page.
  const [selected, setSelected] = React.useState<Map<string, MediaItem>>(new Map());
  React.useEffect(() => { if (open) setSelected(new Map()); }, [open]);
  function toggle(item: MediaItem) {
    setSelected((previous) => {
      const next = multiple ? new Map(previous) : new Map<string, MediaItem>();
      if (previous.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  }
  function confirmSelection() {
    const items = Array.from(selected.values());
    if (multiple) onSelectMany?.(items);
    else if (items[0]) onSelect?.(items[0]);
    onClose();
  }
  const close = () => { if (!library.progress) onClose(); };

  return <Modal open={open} onClose={close} title="Media Library" description="Choose from all uploaded images, or upload new ones." size="xl" footer={
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-stone-600" aria-live="polite">{selected.size} selected {selected.size > 0 && <button type="button" className="ml-2 underline" onClick={() => setSelected(new Map())}>Clear</button>}</div>
      <div className="flex gap-2"><Button type="button" variant="ghost" disabled={!!library.progress} onClick={close}>Cancel</Button><Button type="button" disabled={!selected.size || !!library.progress} onClick={confirmSelection}>{multiple ? `Add ${selected.size} image${selected.size === 1 ? "" : "s"}` : "Select image"}</Button></div>
    </div>
  }>
    <div className="space-y-4">
      <LibraryToolbar library={library} />
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void library.upload(e.dataTransfer.files); }} className="min-h-40 rounded-md border border-dashed border-stone-300 p-3" aria-busy={library.loading}>
        {library.error ? <LibraryError library={library} /> : library.loading ? <div className="flex h-40 items-center justify-center" role="status"><Loader2 className="h-6 w-6 animate-spin" /><span className="sr-only">Loading images</span></div> : !library.items.length ? <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-stone-500"><ImageIcon className="h-8 w-8" />{library.q ? "No images match your search. Try another filename." : "Drop images here, or use Upload images."}</div> :
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {library.items.map((item) => <button key={item.id} type="button" aria-pressed={selected.has(item.id)} aria-label={`Select ${item.filename}`} title={item.filename} onClick={() => toggle(item)} className={cn("relative min-w-0 overflow-hidden rounded-md border-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2", selected.has(item.id) ? "border-ink bg-stone-100" : "border-stone-200 hover:border-stone-400")}>
              <div className="aspect-[4/3] bg-stone-100 p-1"><img src={item.url} alt={item.altText ?? item.filename} loading="lazy" className="h-full w-full object-contain" /></div>
              {selected.has(item.id) && <span className="absolute right-2 top-2 rounded-full bg-ink p-1 text-white"><Check className="h-4 w-4" /></span>}
              <span className="block truncate px-2 py-2 text-xs">{item.filename}</span>
            </button>)}
          </div>}
      </div>
      <LibraryPagination library={library} />
    </div>
  </Modal>;
}
