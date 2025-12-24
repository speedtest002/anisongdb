import type { MiddlewareHandler } from 'hono';

interface CacheOptions {
    /** Cache duration in seconds */
    maxAge?: number;
    /** Allow caching by CDN/proxies */
    public?: boolean;
    /** Stale-while-revalidate duration in seconds */
    staleWhileRevalidate?: number;
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
            cacheValue += `, max-age=${maxAge}`;

            if (staleWhileRevalidate > 0) {
                cacheValue += `, stale-while-revalidate=${staleWhileRevalidate}`;
            }

            c.header('Cache-Control', cacheValue);
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
