import type { MiddlewareHandler } from 'hono';

/**
 * Request logger middleware
 * Logs request method, path, status, and duration
 */
export const requestLogger: MiddlewareHandler = async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    console.log(`--> ${method} ${path}`);

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    console.log(`<-- ${method} ${path} ${status} ${duration}ms`);
};

/**
 * Request timing middleware
 * Adds Server-Timing header with processing duration
 */
export const requestTiming: MiddlewareHandler = async (c, next) => {
    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    c.header('Server-Timing', `total;dur=${duration}`);
};
