"use client";

import * as React from "react";
import { ImagePlus, X } from "lucide-react";
import { MediaPicker, type MediaItem } from "./media-picker";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  name: string;
  label?: string;
  defaultValue?: { id: string; url: string; altText?: string | null } | null;
  folder?: string;
  aspect?: string;
  className?: string;
  /** Overrides the automatic folder-based size hint. */
  hint?: string;
}

/**
 * Recommended upload sizes shown under each picker, keyed by the folder the
 * image is used in. Images are auto-optimised to WebP and capped at 2560px.
 */
const SIZE_HINTS: Record<string, string> = {
  hero: "Recommended: 2560×1440 (16:9), landscape",
  portfolio: "Recommended: 1600×2000 (4:5), portrait, keep the subject centered",
  og: "Recommended: 1200×630 (1.91:1), landscape",
  categories: "Recommended: 1200×1600 (3:4), portrait",
  services: "Recommended: 1200×1500 (4:5), portrait",
  testimonials: "Recommended: 400×400 (1:1), square",
  clients: "Transparent PNG or SVG · ~600×300",
  awards: "Transparent PNG · ~400×200",
  journal: "Recommended: 1600×900 (16:9), landscape",
  pages: "Recommended: 1200×1500 (4:5), portrait",
};

/** Single-image selector backed by the media library. Emits the media id via a hidden input. */
export function ImageField({
  name,
  label,
  defaultValue = null,
  folder = "uploads",
  aspect = "aspect-[4/3]",
  className,
  hint,
}: ImageFieldProps) {
  const sizeHint = hint ?? SIZE_HINTS[folder];
  const [media, setMedia] = React.useState<Pick<MediaItem, "id" | "url" | "altText"> | null>(
    defaultValue ? { id: defaultValue.id, url: defaultValue.url, altText: defaultValue.altText ?? null } : null
  );
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>}
      <input type="hidden" name={name} value={media?.id ?? ""} />
      {media ? (
        <div className={cn("group relative w-full overflow-hidden rounded-md border border-stone-200 bg-stone-100", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.altText ?? ""} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="bg-white px-3 py-1.5 text-xs font-medium text-ink"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="flex h-8 w-8 items-center justify-center bg-white text-red-600"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-stone-300 bg-stone-50 text-stone-400 transition-colors hover:border-ink hover:text-ink",
            aspect
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs font-medium">Choose image</span>
        </button>
      )}
      {sizeHint && <p className="mt-2 text-xs text-stone-500">{sizeHint}</p>}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => setMedia({ id: m.id, url: m.url, altText: m.altText })}
        folder={folder}
      />
    </div>
  );
}
