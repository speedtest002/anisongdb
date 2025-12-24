import type { MiddlewareHandler } from 'hono';

/**
 * Simple in-memory rate limiter for Cloudflare Workers
 * Note: This uses a Map which resets on worker restart.
 * For production, consider using Cloudflare KV or Durable Objects
 */

interface RateLimitOptions {
    /** Time window in milliseconds */
    windowMs?: number;
    /** Maximum requests per window */
    limit?: number;
    /** Custom key generator function */
    keyGenerator?: (c: Parameters<MiddlewareHandler>[0]) => string;
    /** Custom message when rate limited */
    message?: string;
}

// In-memory store (note: resets on worker restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter middleware
 * Limits requests per IP address within a time window
 */
export const rateLimiter = (
    options: RateLimitOptions = {},
): MiddlewareHandler => {
    const {
        windowMs = 60 * 1000, // 1 minute default
        limit = 100,
        keyGenerator = (c) =>
            c.req.header('CF-Connecting-IP') ||
            c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
            'unknown',
        message = 'Too many requests, please try again later.',
    } = options;

    return async (c, next) => {
        const key = keyGenerator(c);
        const now = Date.now();

        // Get or create rate limit entry
        let entry = rateLimitStore.get(key);

        if (!entry || now > entry.resetTime) {
            // Create new window
            entry = {
                count: 0,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, entry);
        }

        entry.count++;

        // Set rate limit headers
        const remaining = Math.max(0, limit - entry.count);
        const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

        c.header('X-RateLimit-Limit', limit.toString());
        c.header('X-RateLimit-Remaining', remaining.toString());
        c.header('X-RateLimit-Reset', resetSeconds.toString());

        // Check if over limit
        if (entry.count > limit) {
            c.header('Retry-After', resetSeconds.toString());
            return c.json(
                {
                    success: false,
                    error: message,
                },
                429,
            );
        }

        await next();
    };
};

/**
 * Cleanup old entries periodically (call this occasionally)
 */
export const cleanupRateLimitStore = (): void => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
};
