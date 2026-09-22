import Image from "next/image";
import { focalToObjectPosition, cn } from "@/lib/utils";

interface MediaLike {
  url: string;
  altText?: string | null;
  blurDataUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaImageProps {
  media?: MediaLike | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  focal?: string;
  /** Fill mode inside a positioned parent (default) or intrinsic sizing. */
  fill?: boolean;
}

/**
 * Wraps next/image with blur placeholders, focal object-position and a
 * graceful empty state when no media is set.
 */
export function MediaImage({
  media,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  focal = "CENTER",
  fill = true,
}: MediaImageProps) {
  if (!media?.url) {
    return (
      <div
        className={cn("flex items-center justify-center bg-stone-100 text-stone-300", className)}
        aria-hidden
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  const objectPosition = focalToObjectPosition[focal] ?? "center";
  const blurProps = media.blurDataUrl
    ? ({ placeholder: "blur", blurDataURL: media.blurDataUrl } as const)
    : ({ placeholder: "empty" } as const);

  if (fill) {
    return (
      <Image
        src={media.url}
        alt={alt ?? media.altText ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        style={{ objectPosition }}
        {...blurProps}
      />
    );
  }

  return (
    <Image
      src={media.url}
      alt={alt ?? media.altText ?? ""}
      width={media.width ?? 1200}
      height={media.height ?? 1500}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto w-full", className)}
      {...blurProps}
    />
  );
}
