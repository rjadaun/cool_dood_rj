/**
 * Small runtime-safe accessor for environment variables.
 * Avoids scattering `process.env.X!` across the codebase.
 */

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  siteUrl: optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  authSecret: () => required("AUTH_SECRET"),
  storage: {
    provider: optional("STORAGE_PROVIDER", "local"),
    bucket: optional("STORAGE_BUCKET"),
    region: optional("STORAGE_REGION"),
    endpoint: optional("STORAGE_ENDPOINT"),
    accessKey: optional("STORAGE_ACCESS_KEY"),
    secretKey: optional("STORAGE_SECRET_KEY"),
    publicUrl: optional("STORAGE_PUBLIC_URL"),
  },
  cloudinary: {
    cloudName: optional("CLOUDINARY_CLOUD_NAME"),
    apiKey: optional("CLOUDINARY_API_KEY"),
    apiSecret: optional("CLOUDINARY_API_SECRET"),
    folder: optional("CLOUDINARY_FOLDER", "lumiere"),
  },
  email: {
    provider: optional("EMAIL_PROVIDER", "log"),
    from: optional("EMAIL_FROM", "Rjadaun <hello@rjadaun.com>"),
    resendKey: optional("RESEND_API_KEY"),
  },
  admin: {
    email: optional("ADMIN_EMAIL", "admin@lumiere.studio"),
    password: optional("ADMIN_PASSWORD", "ChangeMe!2026"),
    name: optional("ADMIN_NAME", "Studio Admin"),
  },
  gaId: optional("NEXT_PUBLIC_GA_ID"),
  rateLimitDisabled: optional("RATE_LIMIT_DISABLED") === "true",
  isProd: process.env.NODE_ENV === "production",
};
