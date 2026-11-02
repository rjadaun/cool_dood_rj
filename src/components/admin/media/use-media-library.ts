"use client";

import * as React from "react";
import { toast } from "sonner";
import { readMediaResponse, uploadMedia } from "@/lib/media/client";
import type { MediaItem } from "@/lib/media/shared";

export function useMediaLibrary(active = true, folder = "uploads") {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [query, setQuery] = React.useState({ q: "", page: 1 });
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [revision, refresh] = React.useReducer((n) => n + 1, 0);
  const [progress, setProgress] = React.useState<{ current: number; total: number; filename: string } | null>(null);
  const uploading = React.useRef(false);

  React.useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.q, page: String(query.page) });
        const response = await fetch(`/api/admin/media?${params}`, { signal: controller.signal, cache: "no-store" });
        const data = await readMediaResponse<{ items: MediaItem[]; total: number; totalPages: number; page: number }>(response);
        if (controller.signal.aborted) return;
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        if (data.page !== query.page) setQuery((prev) => ({ ...prev, page: data.page }));
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load media.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [active, query, revision]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length || uploading.current) return;
    uploading.current = true;
    let succeeded = 0;
    try {
      for (const [index, file] of list.entries()) {
        setProgress({ current: index + 1, total: list.length, filename: file.name });
        try { await uploadMedia(file, folder); succeeded++; }
        catch (err) { toast.error(`${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`, { duration: 8000 }); }
      }
      if (succeeded) {
        toast.success(`Uploaded ${succeeded} of ${list.length} image${list.length === 1 ? "" : "s"}.`);
        setQuery({ q: "", page: 1 });
        refresh();
      }
    } finally { uploading.current = false; setProgress(null); }
  }

  return { items, setItems, q: query.q, page: query.page, total, totalPages, loading, error, progress, upload, refresh,
    search: (q: string) => setQuery({ q, page: 1 }),
    goToPage: (page: number) => setQuery((prev) => ({ ...prev, page })),
  };
}
