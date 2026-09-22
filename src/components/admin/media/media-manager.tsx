"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Search, UploadCloud, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/field";
import { formatBytes } from "@/lib/utils";
import type { MediaItem } from "./media-picker";

export function MediaManager() {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<MediaItem | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q, load]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) => [...data.items, ...prev]);
      toast.success(`Uploaded ${data.items.length} file(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!confirm(`Delete "${item.filename}"?`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Deleted.");
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Could not delete.");
    }
  }

  async function saveMeta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/media/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText: fd.get("altText"), caption: fd.get("caption") }),
    });
    if (res.ok) {
      const { media } = await res.json();
      setItems((prev) => prev.map((i) => (i.id === media.id ? { ...i, altText: media.altText } : i)));
      toast.success("Saved.");
      setEditing(null);
    }
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(new URL(item.url, window.location.origin).href);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search files…"
            className="h-10 w-full border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        <Button onClick={() => inputRef.current?.click()} loading={uploading}>
          <UploadCloud className="h-4 w-4" /> Upload files
        </Button>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 text-sm text-stone-400">
            <UploadCloud className="mb-2 h-8 w-8" />
            No media yet, upload your first files.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-lg border border-stone-200 bg-white">
                <button type="button" onClick={() => setEditing(item)} className="relative block aspect-square w-full bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                </button>
                <div className="flex items-center justify-between p-2">
                  <span className="truncate text-[11px] text-stone-400">{formatBytes(item.size)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => copyUrl(item)} title="Copy URL" className="text-stone-400 hover:text-ink">
                      {copied === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => remove(item)} title="Delete" className="text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit media" size="md">
        {editing && (
          <form onSubmit={saveMeta} className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editing.url} alt="" className="h-full w-full object-contain" />
            </div>
            <p className="text-xs text-stone-400">
              {editing.filename} · {editing.width}×{editing.height} · {formatBytes(editing.size)}
            </p>
            <Field label="Alt text" htmlFor="altText" hint="Describe the image for accessibility & SEO.">
              <Input id="altText" name="altText" defaultValue={editing.altText ?? ""} />
            </Field>
            <Field label="Caption" htmlFor="caption">
              <Input id="caption" name="caption" defaultValue="" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
