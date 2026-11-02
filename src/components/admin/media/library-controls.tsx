"use client";

import * as React from "react";
import { Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_ACCEPT } from "@/lib/media/shared";
import type { useMediaLibrary } from "./use-media-library";

type Library = ReturnType<typeof useMediaLibrary>;

export function LibraryToolbar({ library }: { library: Library }) {
  const input = React.useRef<HTMLInputElement>(null);
  return <div className="space-y-3">
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
        <input aria-label="Search media" value={library.q} onChange={(e) => library.search(e.target.value)} placeholder="Search filename or alt text…" className="h-10 w-full rounded-md border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-ink" />
      </div>
      <input ref={input} type="file" accept={IMAGE_ACCEPT} multiple hidden onChange={(e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; void library.upload(files); }} />
      <Button type="button" size="sm" loading={!!library.progress} onClick={() => input.current?.click()}><UploadCloud className="h-4 w-4" />Upload images</Button>
    </div>
    <p className="text-xs text-stone-500">JPEG, PNG, WebP, AVIF, GIF or SVG · Up to 15 MB each. Large photos are resized for upload; GIFs use their first frame.</p>
    {library.progress && <div role="status" aria-live="polite" className="rounded-md bg-stone-100 p-3 text-sm">
      <p className="truncate">Uploading {library.progress.current} of {library.progress.total}: {library.progress.filename}</p>
      <progress className="mt-2 h-2 w-full accent-stone-800" value={library.progress.current - 1} max={library.progress.total} aria-label="Upload progress" />
    </div>}
  </div>;
}

export function LibraryPagination({ library }: { library: Library }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
    <span role="status">{library.total} image{library.total === 1 ? "" : "s"}{library.q ? " matching search" : " in library"} · Page {library.page} of {library.totalPages}</span>
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" disabled={library.loading || library.page <= 1} onClick={() => library.goToPage(library.page - 1)}>Previous</Button>
      <Button type="button" variant="outline" size="sm" disabled={library.loading || library.page >= library.totalPages} onClick={() => library.goToPage(library.page + 1)}>Next</Button>
    </div>
  </div>;
}

export function LibraryError({ library }: { library: Library }) {
  return <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center text-sm text-red-700">
    {library.error}<Button type="button" variant="outline" size="sm" onClick={library.refresh}>Retry</Button>
  </div>;
}
