import { z } from "zod";

const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const focal = z.enum([
  "CENTER", "TOP", "BOTTOM", "LEFT", "RIGHT",
  "TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT",
]);

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^(https?:\/\/|\/|mailto:|tel:)/.test(v), "Enter a valid URL")
  .optional()
  .or(z.literal(""));

const idBase = z.object({ id: z.string().optional() });

// ── Hero ──
export const heroSlideSchema = idBase.extend({
  label: z.string().max(60).optional().or(z.literal("")),
  title: z.string().min(1, "Title is required").max(160),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(400).optional().or(z.literal("")),
  ctaText: z.string().max(40).optional().or(z.literal("")),
  ctaUrl: optionalUrl,
  ctaSecondary: z.string().max(40).optional().or(z.literal("")),
  ctaSecondaryUrl: optionalUrl,
  imageId: z.string().optional().or(z.literal("")),
  overlay: z.coerce.number().min(0).max(100).default(45),
  focal: focal.default("CENTER"),
  transition: z.enum(["FADE", "CROSSFADE", "KEN_BURNS", "SLOW_ZOOM"]).default("KEN_BURNS"),
  durationMs: z.coerce.number().min(2000).max(15000).default(6000),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;

// ── Category ──
export const categorySchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(80),
  slug: z.string().max(80).optional().or(z.literal("")),
  description: z.string().max(400).optional().or(z.literal("")),
  coverId: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// ── Portfolio ──
export const portfolioImageSchema = z.object({
  id: z.string().optional(),
  mediaId: z.string().min(1),
  caption: z.string().optional().or(z.literal("")),
  altText: z.string().optional().or(z.literal("")),
  focal: focal.default("CENTER"),
  aspect: z.enum(["ORIGINAL", "PORTRAIT", "LANDSCAPE", "SQUARE", "PANORAMIC"]).default("ORIGINAL"),
  visible: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

export const portfolioSchema = idBase.extend({
  title: z.string().min(1, "Title is required").max(160),
  slug: z.string().max(160).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  year: z.coerce.number().min(1970).max(2100).optional().or(z.literal("")),
  coverId: z.string().optional().or(z.literal("")),
  credits: z.string().max(2000).optional().or(z.literal("")),
  services: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  galleryLayout: z.enum(["FULL_WIDTH", "TWO_COLUMN", "THREE_COLUMN", "MIXED", "PORTRAIT_LANDSCAPE"]).default("MIXED"),
  featured: z.coerce.boolean().default(false),
  status: status.default("DRAFT"),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  ogImageId: z.string().optional().or(z.literal("")),
  images: z.array(portfolioImageSchema).default([]),
});
export type PortfolioInput = z.infer<typeof portfolioSchema>;

// ── Service ──
export const serviceSchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().max(120).optional().or(z.literal("")),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  longDescription: z.string().max(4000).optional().or(z.literal("")),
  imageId: z.string().optional().or(z.literal("")),
  number: z.string().max(6).optional().or(z.literal("")),
  ctaText: z.string().max(40).optional().or(z.literal("")),
  ctaUrl: optionalUrl,
  features: z.array(z.string()).default([]),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

// ── Client ──
export const clientSchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(120),
  website: optionalUrl,
  logoId: z.string().optional().or(z.literal("")),
  logoDarkId: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type ClientInput = z.infer<typeof clientSchema>;

// ── Testimonial ──
export const testimonialSchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(120),
  company: z.string().max(120).optional().or(z.literal("")),
  role: z.string().max(120).optional().or(z.literal("")),
  quote: z.string().min(1, "Quote is required").max(1200),
  rating: z.coerce.number().min(1).max(5).optional().or(z.literal("")),
  imageId: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ── Award ──
export const awardSchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(160),
  year: z.coerce.number().min(1900).max(2100).optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
  logoId: z.string().optional().or(z.literal("")),
  link: optionalUrl,
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type AwardInput = z.infer<typeof awardSchema>;

// ── Stat ──
export const statSchema = idBase.extend({
  value: z.string().min(1, "Value is required").max(60),
  label: z.string().min(1, "Label is required").max(120),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type StatInput = z.infer<typeof statSchema>;

// ── Package ──
export const packageSchema = idBase.extend({
  name: z.string().min(1, "Name is required").max(120),
  price: z.string().max(60).optional().or(z.literal("")),
  priceSuffix: z.string().max(60).optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
  ctaText: z.string().max(40).optional().or(z.literal("")),
  ctaUrl: optionalUrl,
  featured: z.coerce.boolean().default(false),
  features: z.array(z.string()).default([]),
  sortOrder: z.coerce.number().default(0),
  status: status.default("PUBLISHED"),
});
export type PackageInput = z.infer<typeof packageSchema>;

// ── Social ──
export const socialSchema = idBase.extend({
  platform: z.enum([
    "INSTAGRAM", "YOUTUBE", "BEHANCE", "PINTEREST", "LINKEDIN", "FACEBOOK", "TIKTOK", "X",
  ]),
  url: z.string().url("Enter a valid URL"),
  username: z.string().max(80).optional().or(z.literal("")),
  visible: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});
export type SocialInput = z.infer<typeof socialSchema>;

// ── Blog ──
export const blogSchema = idBase.extend({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().max(200).optional().or(z.literal("")),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  coverId: z.string().optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  author: z.string().max(120).optional().or(z.literal("")),
  status: status.default("DRAFT"),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
});
export type BlogInput = z.infer<typeof blogSchema>;

// ── Page ──
export const pageSchema = idBase.extend({
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  heading: z.string().max(200).optional().or(z.literal("")),
  subheading: z.string().max(400).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  imageId: z.string().optional().or(z.literal("")),
  seoTitle: z.string().max(160).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  visible: z.coerce.boolean().default(true),
});
export type PageInput = z.infer<typeof pageSchema>;

// ── Settings ──
export const settingsSchema = z.object({
  siteName: z.string().min(1).max(120),
  tagline: z.string().max(200).optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  faviconUrl: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(60).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  defaultSeoTitle: z.string().max(200).optional().or(z.literal("")),
  defaultSeoDesc: z.string().max(320).optional().or(z.literal("")),
  ogImageUrl: z.string().optional().or(z.literal("")),
  gaId: z.string().max(40).optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  copyright: z.string().max(200).optional().or(z.literal("")),
  timezone: z.string().max(60).default("UTC"),
  maintenanceMode: z.coerce.boolean().default(false),
  showPricingPublic: z.coerce.boolean().default(true),
  newsletterEnabled: z.coerce.boolean().default(true),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

// ── User ──
export const userSchema = idBase.extend({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  status: z.enum(["ACTIVE", "DISABLED"]).default("ACTIVE"),
  password: z.string().min(8, "Minimum 8 characters").optional().or(z.literal("")),
});
export type UserInput = z.infer<typeof userSchema>;

// ── Public: contact ──
export const contactSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  projectType: z.string().max(80).optional().or(z.literal("")),
  budget: z.string().max(80).optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Tell us a little more (min 10 characters)").max(4000),
  website: z.string().max(200).optional().or(z.literal("")),
  referral: z.string().max(120).optional().or(z.literal("")),
  // Honeypot — must stay empty.
  company_url: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ── Public: newsletter ──
export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
  // Honeypot
  website: z.string().max(0).optional(),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
