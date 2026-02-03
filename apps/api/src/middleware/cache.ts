import type { MiddlewareHandler } from 'hono';

interface CacheOptions {
    /** Cache duration in seconds */
    maxAge?: number;
    /** Allow caching by CDN/proxies */
    public?: boolean;
    /** Stale-while-revalidate duration in seconds */
    staleWhileRevalidate?: number;
    /** Whether the resource is immutable (long-term cache) */
    immutable?: boolean;
}

/**
 * Cache control middleware for GET requests
 * Only applies cache headers to successful GET responses
 */
export const cacheControl = (options: CacheOptions = {}): MiddlewareHandler => {
    const {
        maxAge = 60,
        public: isPublic = true,
        staleWhileRevalidate = 0,
        immutable = false,
    } = options;
    return async (c, next) => {
        await next();
        // Only cache successful GET requests
        if (
            c.req.method === 'GET' &&
            c.res.status >= 200 &&
            c.res.status < 300
        ) {
            let cacheValue = isPublic ? 'public' : 'private';

            if (immutable) {
                // Set a very long cache for immutable resources (1 year)
                cacheValue += `, max-age=31536000, immutable`;
            } else {
                cacheValue += `, max-age=${maxAge}`;
                if (staleWhileRevalidate > 0) {
                    cacheValue += `, stale-while-revalidate=${staleWhileRevalidate}`;
                }
            }

            c.header('Cache-Control', cacheValue);
        }
    };
};

/**
 * Cache until the next daily update time (e.g., 5 AM UTC)
 */
export const dailyCache = (updateHourUtc: number = 5): MiddlewareHandler => {
    return async (c, next) => {
        await next();
        if (
            c.req.method === 'GET' &&
            c.res.status >= 200 &&
            c.res.status < 300
        ) {
            const now = new Date();
            const nextUpdate = new Date(now);
            nextUpdate.setUTCHours(updateHourUtc, 0, 0, 0);

            // If it's already past update time today, set for tomorrow
            if (now >= nextUpdate) {
                nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1);
            }

            const secondsUntilUpdate = Math.floor(
                (nextUpdate.getTime() - now.getTime()) / 1000,
            );

            // max-age is the time until the next 5 AM update
            // stale-while-revalidate allows 1 hour of grace during potential update lag
            c.header(
                'Cache-Control',
                `public, max-age=${secondsUntilUpdate}, stale-while-revalidate=3600`,
            );
        }
    };
};

/**
 * No cache middleware - prevents caching
 * Useful for dynamic or sensitive endpoints
 */
export const noCache: MiddlewareHandler = async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    c.header('Pragma', 'no-cache');
};
