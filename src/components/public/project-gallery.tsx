"use client";

import * as React from "react";
import { X, ArrowLeft, ArrowRight, Expand } from "lucide-react";
import type { GalleryLayout, Media, PortfolioImage } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { imageRatio, imageRows } from "@/lib/gallery/layout";

type Img = Pick<PortfolioImage, "id" | "caption" | "altText" | "aspect"> & {
  media: Media;
};

export function ProjectGallery({
  images,
  layout,
  projectTitle,
}: {
  images: Img[];
  layout: GalleryLayout;
  projectTitle?: string;
}) {
  const [active, setActive] = React.useState<number | null>(null);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const opener = React.useRef<HTMLButtonElement | null>(null);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const rows = React.useMemo(
    () => imageRows(images, (img) => imageRatio(img.media, img.aspect), layout),
    [images, layout],
  );
  const isOpen = active !== null;
  const current = active === null ? null : images[active];
  const go = (direction: number) =>
    setActive((index) =>
      index === null
        ? null
        : (index + direction + images.length) % images.length,
    );

  React.useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previous = opener.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <div className="image-gallery" aria-label="Project photographs">
        {rows.map((row) => (
          <div
            key={row[0]!.id}
            className="photo-row"
            data-single={row.length === 1}
            style={
              {
                "--columns": row
                  .map((img) => `${imageRatio(img.media, img.aspect)}fr`)
                  .join(" "),
                "--single-width":
                  imageRatio(row[0]!.media, row[0]!.aspect) < 1
                    ? "760px"
                    : "100%",
              } as React.CSSProperties
            }
          >
            {row.map((img) => (
              <figure key={img.id} className="min-w-0">
                <button
                  type="button"
                  className="gallery-image group"
                  style={{ aspectRatio: imageRatio(img.media, img.aspect) }}
                  onClick={(event) => {
                    opener.current = event.currentTarget;
                    setActive(images.indexOf(img));
                  }}
                  aria-label={`Open photograph ${images.indexOf(img) + 1}${img.caption || img.altText ? `: ${img.caption || img.altText}` : ""}`}
                  aria-haspopup="dialog"
                >
                  <MediaImage
                    priority={images.indexOf(img) < rows[0]!.length}
                    media={img.media}
                    alt={img.altText || img.media.altText || img.caption || ""}
                    sizes={
                      row.length === 1
                        ? "(max-width: 768px) 100vw, 85vw"
                        : "(max-width: 640px) 100vw, 60vw"
                    }
                    className="object-contain"
                  />
                  <span className="project-open" aria-hidden>
                    <Expand size={17} />
                  </span>
                </button>
                {img.caption && (
                  <figcaption className="gallery-caption">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-lightbox"
        aria-label="Photograph viewer"
        onCancel={() => setActive(null)}
        onClose={() => setActive(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
          }
          if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            setActive(images.length - 1);
          }
        }}
      >
        {current && (
          <div className="lightbox-inner">
            <div className="lightbox-top">
              {projectTitle && <p className="lightbox-project-title">{projectTitle}</p>}
              <span aria-live="polite">
                {active! + 1} / {images.length}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => setActive(null)}
                aria-label="Close photograph viewer"
              >
                <X size={24} />
              </button>
            </div>
            <div
              className="lightbox-stage"
              onClick={(event) => {
                if (event.target === event.currentTarget) setActive(null);
              }}
              onPointerDown={(event) => {
                if (event.pointerType === "touch")
                  touchStart.current = { x: event.clientX, y: event.clientY };
              }}
              onPointerCancel={() => {
                touchStart.current = null;
              }}
              onPointerUp={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (
                  start &&
                  Math.abs(event.clientX - start.x) > 50 &&
                  Math.abs(event.clientY - start.y) < 80
                )
                  go(event.clientX < start.x ? 1 : -1);
              }}
            >
              <div className="lightbox-photo">
                <MediaImage
                  key={current.id}
                  media={current.media}
                  alt={
                    current.altText ||
                    current.media.altText ||
                    current.caption ||
                    ""
                  }
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              </div>
            </div>
            <div className="lightbox-bottom">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={images.length < 2}
                aria-label="Previous photograph"
              >
                <ArrowLeft size={22} />
              </button>
              <p aria-live="polite">
                {current.caption ||
                  current.altText ||
                  current.media.altText ||
                  (images.length > 1 ? "Use the arrows or swipe to explore" : "")}
              </p>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={images.length < 2}
                aria-label="Next photograph"
              >
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
