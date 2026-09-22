import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { SiteSetting } from "@prisma/client";

export const SETTINGS_TAG = "site-settings";

const DEFAULTS: Omit<SiteSetting, "updatedAt"> = {
  id: "singleton",
  siteName: "Rjadaun",
  tagline: "Editorial & commercial photography",
  logoUrl: null,
  faviconUrl: null,
  email: "hello@lumiere.studio",
  phone: null,
  address: null,
  defaultSeoTitle: "Rjadaun · Editorial & Commercial Photography",
  defaultSeoDesc:
    "A creative studio crafting fashion, beauty and commercial photography for brands and people who value detail.",
  ogImageUrl: null,
  gaId: null,
  contactEmail: "hello@lumiere.studio",
  copyright: null,
  timezone: "UTC",
  maintenanceMode: false,
  showPricingPublic: true,
  newsletterEnabled: true,
};

/** Cached site settings singleton, with sane defaults if the row is absent. */
export const getSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    try {
      const row = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
      return row ?? { ...DEFAULTS, updatedAt: new Date() };
    } catch {
      // DB unreachable (e.g. during build without a database) — fall back to
      // sensible defaults so shared layouts and error pages still render.
      return { ...DEFAULTS, updatedAt: new Date() };
    }
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG], revalidate: 3600 }
);
