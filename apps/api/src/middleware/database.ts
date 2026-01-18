import type { MiddlewareHandler } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema.js';
import type { Env, Variables } from '../types.js';

/**
 * Database middleware - Initializes Drizzle ORM with D1
 * Uses casing: 'snake_case' to map snake_case DB columns to camelCase in TypeScript
 */
export const databaseMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const db = drizzle(c.env.DB, { schema, casing: 'snake_case' });
    c.set('db', db);
    await next();
};

/**
 * Database middleware with query logging (for development)
 */
export const databaseMiddlewareWithLogging: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const db = drizzle(c.env.DB, {
        schema,
        casing: 'snake_case',
        logger: true,
    });
    c.set('db', db);
    await next();
};
