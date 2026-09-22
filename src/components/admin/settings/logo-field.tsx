"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoFieldProps {
  /** Form field name — the uploaded file's URL is posted under this key. */
  name: string;
  defaultValue?: string | null;
}

// Checkerboard so transparent logos are easy to judge.
const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: "#fff",
  backgroundImage:
    "linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 8px 8px",
};

/**
 * Logo uploader for site settings. Sends the chosen file to the media library
 * straight from the device and emits its URL through a hidden input, so it is
 * saved together with the rest of the settings form.
 */
export function LogoField({ name, defaultValue }: LogoFieldProps) {
  const saved = defaultValue ?? "";
  const [url, setUrl] = React.useState(saved);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "branding");
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUrl(data.items[0].url);
      toast.success("Logo uploaded. Click “Save settings” to apply it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires onChange.
    e.target.value = "";
    if (file) upload(file);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={onPick}
      />

      {url ? (
        <>
          <div className="flex h-28 items-center justify-center border border-ink/15 p-4" style={CHECKERBOARD}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Current logo" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
              <UploadCloud className="h-4 w-4" /> Replace logo
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={uploading} onClick={() => setUrl("")}>
              Remove
            </Button>
            {url !== saved && <span className="text-xs text-amber-600">Not saved yet — click “Save settings”.</span>}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-stone-50 text-stone-500 transition-colors hover:border-ink hover:text-ink disabled:pointer-events-none"
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-xs font-medium">{uploading ? "Uploading…" : "Upload from device"}</span>
          </button>
          {saved && url === "" && <p className="text-xs text-amber-600">Logo removed — click “Save settings” to apply.</p>}
        </>
      )}
    </div>
  );
}
