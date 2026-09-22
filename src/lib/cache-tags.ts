/** Central registry of cache tags used with revalidateTag / unstable_cache. */
export const TAGS = {
  settings: "site-settings",
  hero: "hero",
  categories: "categories",
  portfolio: "portfolio",
  services: "services",
  clients: "clients",
  testimonials: "testimonials",
  awards: "awards",
  packages: "packages",
  social: "social",
  stats: "stats",
  blog: "blog",
  pages: "pages",
  home: "home-sections",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];
