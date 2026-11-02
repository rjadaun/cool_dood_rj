"use client";

/* eslint-disable @next/next/no-img-element -- Admin previews use original storage URLs. */

import * as React from "react";
import { toast } from "sonner";
import { Loader2, UploadCloud, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { formatBytes } from "@/lib/utils";
import { readMediaResponse } from "@/lib/media/client";
import type { MediaItem } from "@/lib/media/shared";
import { useMediaLibrary } from "./use-media-library";
import { LibraryToolbar, LibraryPagination, LibraryError } from "./library-controls";

export function MediaManager() {
  const library = useMediaLibrary();
  const [editing, setEditing] = React.useState<MediaItem | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  async function remove(item: MediaItem) {
    if (deleting || !confirm(`Delete "${item.filename}" permanently? Files used by content cannot be deleted.`)) return;
    setDeleting(item.id);
    try {
      await readMediaResponse(await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" }));
      library.refresh();
      toast.success("Image deleted.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not delete image."); }
    finally { setDeleting(null); }
  }

  async function saveMeta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing || saving) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const { media } = await readMediaResponse<{ media: MediaItem }>(await fetch(`/api/admin/media/${editing.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: fd.get("altText"), caption: fd.get("caption") }),
      }));
      library.setItems((prev) => prev.map((item) => item.id === media.id ? media : item));
      toast.success("Image details saved.");
      setEditing(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not save image details."); }
    finally { setSaving(false); }
  }

  async function copyUrl(item: MediaItem) {
    try { await navigator.clipboard.writeText(new URL(item.url, window.location.origin).href); toast.success("Image URL copied."); }
    catch { toast.error("Could not copy the URL. Check your browser clipboard permission."); }
  }

  return <div className="space-y-5">
    <LibraryToolbar library={library} />
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void library.upload(e.dataTransfer.files); }} className="min-h-48" aria-busy={library.loading}>
      {library.error ? <LibraryError library={library} /> : library.loading ? <div className="flex h-48 items-center justify-center" role="status"><Loader2 className="h-6 w-6 animate-spin" /><span className="sr-only">Loading images</span></div> : !library.items.length ? <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 text-sm text-stone-500"><UploadCloud className="h-8 w-8" />{library.q ? "No images match your search." : "Drop images here or upload your first files."}</div> :
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {library.items.map((item) => <div key={item.id} className="min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <button type="button" aria-label={`Edit ${item.filename}`} onClick={() => setEditing(item)} className="block aspect-[4/3] w-full bg-stone-100 p-1"><img src={item.url} alt={item.altText ?? item.filename} loading="lazy" className="h-full w-full object-contain" /></button>
            <div className="p-3"><p className="truncate text-xs font-medium" title={item.filename}>{item.filename}</p><div className="mt-2 flex items-center justify-between gap-1"><span className="text-xs text-stone-500">{formatBytes(item.size)}</span><div className="flex gap-1"><button type="button" onClick={() => void copyUrl(item)} aria-label={`Copy URL for ${item.filename}`} className="rounded p-2 text-stone-500 hover:bg-stone-100"><Copy className="h-4 w-4" /></button><button type="button" onClick={() => void remove(item)} disabled={!!deleting} aria-label={`Delete ${item.filename}`} className="rounded p-2 text-stone-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">{deleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div></div></div>
          </div>)}
        </div>}
    </div>
    <LibraryPagination library={library} />
    <Modal open={!!editing} onClose={() => { if (!saving) setEditing(null); }} title="Edit media" size="md">
      {editing && <form key={editing.id} onSubmit={saveMeta} className="space-y-4">
        <div className="aspect-video rounded bg-stone-100"><img src={editing.url} alt={editing.altText ?? ""} className="h-full w-full object-contain" /></div>
        <p className="break-words text-xs text-stone-500">{editing.filename} · {editing.width && editing.height ? `${editing.width}×${editing.height} · ` : ""}{formatBytes(editing.size)}</p>
        <Field label="Alt text" htmlFor="altText" hint="Describe the image for accessibility and SEO."><Input id="altText" name="altText" maxLength={500} defaultValue={editing.altText ?? ""} /></Field>
        <Field label="Caption" htmlFor="caption"><Input id="caption" name="caption" maxLength={2000} defaultValue={editing.caption ?? ""} /></Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" disabled={saving} onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" loading={saving}>Save details</Button></div>
      </form>}
    </Modal>
  </div>;
}
