import type { Redis } from "ioredis";

/**
 * Sliding window rate limit using Redis.
 * Tracks API calls per Instagram account with TTL-based counters.
 *
 * Meta Graph API limit: 200 calls/hour per account
 */
export async function checkRateLimit(
  redis: Redis,
  accountId: string,
  limit: number = 200,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `rate_limit:ig:${accountId}`;
  const resetAt = now + windowMs;

  // Remove old entries outside window
  await redis.zremrangebyscore(key, "-inf", windowStart);

  // Count current window
  const count = await redis.zcard(key);

  if (count >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Add this call
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  // Set TTL so key auto-expires
  await redis.expire(key, Math.ceil(windowMs / 1000));

  return { allowed: true, remaining: limit - count - 1, resetAt };
}

/**
 * Increment a usage counter for DM sends (monthly bucket).
 */
export async function incrementDmUsage(
  redis: Redis,
  accountId: string,
  month: string // "2025-01"
): Promise<number> {
  const key = `usage:dm:${accountId}:${month}`;
  const count = await redis.incr(key);
  // TTL: 32 days to ensure the key persists for the whole month
  await redis.expire(key, 32 * 24 * 60 * 60);
  return count;
}

/**
 * Get current DM usage for an account in a given month.
 */
export async function getDmUsage(
  redis: Redis,
  accountId: string,
  month: string
): Promise<number> {
  const key = `usage:dm:${accountId}:${month}`;
  const val = await redis.get(key);
  return val ? parseInt(val, 10) : 0;
}
