import { env } from "@/lib/env";

/**
 * Lightweight in-memory sliding-window rate limiter for public endpoints
 * (contact form, newsletter). For multi-instance production, back this with
 * Redis/Upstash — the interface stays the same.
 */
const buckets = new Map<string, number[]>();

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  if (env.rateLimitDisabled) return { success: true, remaining: limit };

  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return { success: false, remaining: 0 };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  // Opportunistic cleanup to keep the map from growing unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }

  return { success: true, remaining: limit - timestamps.length };
}

/** Best-effort client IP extraction from a request. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
