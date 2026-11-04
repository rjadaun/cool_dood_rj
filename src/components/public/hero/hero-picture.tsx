import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import type { Media } from "@prisma/client";
import { focalToObjectPosition } from "@/lib/utils";
import { MediaImage } from "@/components/shared/media-image";

type Photo = Pick<Media, "url" | "altText">;

/** Art direction: the browser selects one source before downloading the image. */
export function HeroPicture({
  image,
  mobileImage,
  title,
  focal = "CENTER",
  mobileFocal = "CENTER",
  priority = false,
}: {
  image: Photo | null;
  mobileImage?: Photo | null;
  title: string;
  focal?: string;
  mobileFocal?: string;
  priority?: boolean;
}) {
  const desktop = image?.url ? image : mobileImage;
  if (!desktop?.url) return <MediaImage alt={title} className="h-full w-full" />;
  const mobile = mobileImage?.url ? mobileImage : null;
  const common = { alt: desktop.altText || title, fill: true, sizes: "100vw" };
  const { props } = getImageProps({ ...common, src: desktop.url });
  const mobileProps = mobile
    ? getImageProps({ ...common, src: mobile.url }).props
    : null;
  const desktopPosition = focalToObjectPosition[image?.url ? focal : mobileFocal] || "center";

  return (
    <picture
      className="hero-picture"
      style={{
        "--hero-focal": desktopPosition,
        "--hero-mobile-focal": mobile
          ? focalToObjectPosition[mobileFocal] || "center"
          : desktopPosition,
      } as CSSProperties}
    >
      {mobileProps && (
        <source media="(max-width: 767px)" srcSet={mobileProps.srcSet || mobileProps.src} sizes="100vw" />
      )}
      {/* getImageProps retains Next's image optimization; picture handles source selection. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        className="hero-picture-image"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
