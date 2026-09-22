import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { absoluteUrl } from "@/lib/utils";

interface BuildMetaInput {
  title?: string | null;
  description?: string | null;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}

/** Composes page metadata from page-level overrides + site defaults. */
export async function buildMetadata(input: BuildMetaInput = {}): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName;
  const title = input.title
    ? `${input.title} · ${siteName}`
    : settings.defaultSeoTitle ?? siteName;
  const description = input.description ?? settings.defaultSeoDesc ?? undefined;
  const url = absoluteUrl(input.path ?? "/");
  const image = input.image ?? settings.ogImageUrl ?? absoluteUrl("/og-default.jpg");

  return {
    title,
    description: description ?? undefined,
    metadataBase: new URL(absoluteUrl("/")),
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: description ?? undefined,
      url,
      siteName,
      type: input.type ?? "website",
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: image ? [image] : undefined,
    },
  };
}
