"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Search, UploadCloud, Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  size: number;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (media: MediaItem) => void;
  onSelectMany?: (media: MediaItem[]) => void;
  multiple?: boolean;
  folder?: string;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  onSelectMany,
  multiple = false,
  folder = "uploads",
}: MediaPickerProps) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<MediaItem | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      toast.error("Could not load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelected(null);
      setSelectedIds(new Set());
      load(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggle(item: MediaItem) {
    if (multiple) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) next.delete(item.id);
        else next.add(item.id);
        return next;
      });
    } else {
      setSelected(item);
    }
  }

  function confirmSelection() {
    if (multiple) {
      onSelectMany?.(items.filter((i) => selectedIds.has(i.id)));
    } else if (selected) {
      onSelect?.(selected);
    }
    onClose();
  }

  const isChosen = (item: MediaItem) => (multiple ? selectedIds.has(item.id) : selected?.id === item.id);
  const chosenCount = multiple ? selectedIds.size : selected ? 1 : 0;

  // Debounced search.
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      fd.append("folder", folder);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      toast.success(`Uploaded ${data.items.length} file(s).`);
      setItems((prev) => [...data.items, ...prev]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaItem, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("File deleted.");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Could not delete file.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media Library"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={chosenCount === 0} onClick={confirmSelection}>
            {multiple ? `Add ${chosenCount} image${chosenCount === 1 ? "" : "s"}` : "Select image"}
          </Button>
        </>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className="h-10 w-full border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <Button size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
          <UploadCloud className="h-4 w-4" /> Upload
        </Button>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        className="min-h-[300px] rounded-md border border-dashed border-stone-200 p-3"
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-stone-400">
            <UploadCloud className="mb-2 h-8 w-8" />
            Drag & drop images here, or use the upload button.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded border-2 bg-stone-100",
                  isChosen(item) ? "border-ink" : "border-transparent hover:border-stone-300"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText ?? ""} className="h-full w-full object-cover" />
                {isChosen(item) && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span
                  onClick={(e) => remove(item, e)}
                  className="absolute left-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white/90 text-red-600 group-hover:flex"
                >
                  <Trash2 className="h-3 w-3" />
                </span>
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink/70 to-transparent px-1.5 py-1 text-left text-[10px] text-paper">
                  {item.width}×{item.height} · {formatBytes(item.size)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
