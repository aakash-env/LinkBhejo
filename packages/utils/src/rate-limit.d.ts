import type { Redis } from "ioredis";
/**
 * Sliding window rate limit using Redis.
 * Tracks API calls per Instagram account with TTL-based counters.
 *
 * Meta Graph API limit: 200 calls/hour per account
 */
export declare function checkRateLimit(redis: Redis, accountId: string, limit?: number, windowMs?: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
}>;
/**
 * Increment a usage counter for DM sends (monthly bucket).
 */
export declare function incrementDmUsage(redis: Redis, accountId: string, month: string): Promise<number>;
/**
 * Get current DM usage for an account in a given month.
 */
export declare function getDmUsage(redis: Redis, accountId: string, month: string): Promise<number>;
//# sourceMappingURL=rate-limit.d.ts.map