import type { MiddlewareHandler } from 'hono';

/**
 * Security headers middleware
 * Adds common security headers to all responses
 */
export const securityHeaders: MiddlewareHandler = async (c, next) => {
    await next();

    // Prevent MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    c.header('X-Frame-Options', 'DENY');

    // Enable XSS filter in older browsers
    c.header('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (disable unnecessary features)
    c.header(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()',
    );
};

/**
 * CORS configuration options
 */
interface CorsOptions {
    origins?: string[];
    methods?: string[];
    allowHeaders?: string[];
    exposeHeaders?: string[];
    maxAge?: number;
    credentials?: boolean;
}

/**
 * Custom CORS middleware with fine-grained control
 */
export const customCors = (options: CorsOptions = {}): MiddlewareHandler => {
    const {
        origins = ['*'],
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders = ['Content-Type', 'Authorization'],
        exposeHeaders = [],
        maxAge = 86400,
        credentials = false,
    } = options;

    return async (c, next) => {
        const origin = c.req.header('Origin');

        // Check if origin is allowed
        const isAllowed =
            origins.includes('*') || (origin && origins.includes(origin));

        if (isAllowed) {
            c.header(
                'Access-Control-Allow-Origin',
                origins.includes('*') ? '*' : origin!,
            );
        }

        c.header('Access-Control-Allow-Methods', methods.join(', '));
        c.header('Access-Control-Allow-Headers', allowHeaders.join(', '));

        if (exposeHeaders.length > 0) {
            c.header('Access-Control-Expose-Headers', exposeHeaders.join(', '));
        }

        c.header('Access-Control-Max-Age', maxAge.toString());

        if (credentials) {
            c.header('Access-Control-Allow-Credentials', 'true');
        }

        // Handle preflight requests
        if (c.req.method === 'OPTIONS') {
            return c.body(null, 204);
        }

        await next();
    };
};
