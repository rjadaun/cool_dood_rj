"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import type { GalleryLayout, Media, PortfolioImage } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { cn } from "@/lib/utils";

type Img = PortfolioImage & { media: Media };

/** Groups images into editorial rows based on the chosen layout. */
function buildRows(images: Img[], layout: GalleryLayout): Img[][] {
  switch (layout) {
    case "FULL_WIDTH":
      return images.map((i) => [i]);
    case "TWO_COLUMN":
      return chunk(images, 2);
    case "THREE_COLUMN":
      return chunk(images, 3);
    case "PORTRAIT_LANDSCAPE":
      return chunk(images, 2);
    case "MIXED":
    default: {
      // Editorial rhythm: full, pair, full, pair…
      const rows: Img[][] = [];
      let i = 0;
      let full = true;
      while (i < images.length) {
        if (full) {
          rows.push([images[i]!]);
          i += 1;
        } else {
          rows.push(images.slice(i, i + 2));
          i += 2;
        }
        full = !full;
      }
      return rows;
    }
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function ProjectGallery({ images, layout }: { images: Img[]; layout: GalleryLayout }) {
  const [active, setActive] = React.useState<number | null>(null);
  const rows = React.useMemo(() => buildRows(images, layout), [images, layout]);

  React.useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((a) => (a === null ? a : (a + 1) % images.length));
      if (e.key === "ArrowLeft") setActive((a) => (a === null ? a : (a - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, images.length]);

  let counter = -1;

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className={cn("grid gap-6 md:gap-8", row.length === 1 ? "grid-cols-1" : row.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}
          >
            {row.map((img) => {
              counter += 1;
              const index = counter;
              const ratio =
                img.media.width && img.media.height ? img.media.width / img.media.height : row.length === 1 ? 1.5 : 0.8;
              return (
                <button
                  key={img.id}
                  onClick={() => setActive(index)}
                  className="group relative block w-full cursor-zoom-in overflow-hidden bg-stone-100"
                  style={{ aspectRatio: String(ratio) }}
                  aria-label={img.caption || img.altText || "View image"}
                >
                  <MediaImage
                    media={img.media}
                    alt={img.altText ?? ""}
                    focal={img.focal}
                    sizes={row.length === 1 ? "100vw" : "(max-width:768px) 100vw, 50vw"}
                    className="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
                  />
                  {img.caption && (
                    <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-xs text-paper opacity-0 transition-opacity group-hover:opacity-100">
                      {img.caption}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && images[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/95 p-4 md:p-10"
            onClick={() => setActive(null)}
          >
            <button
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-paper/70 hover:text-paper"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-paper/70 hover:text-paper"
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => (a === null ? a : (a - 1 + images.length) % images.length));
              }}
              aria-label="Previous"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-paper/70 hover:text-paper"
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => (a === null ? a : (a + 1) % images.length));
              }}
              aria-label="Next"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[active]!.media.url}
                alt={images[active]!.altText ?? ""}
                className="max-h-[85vh] w-auto object-contain"
              />
              {images[active]!.caption && (
                <p className="mt-3 text-center text-sm text-paper/60">{images[active]!.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
