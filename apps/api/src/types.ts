import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './db/schema.js';

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
    DB: D1Database;
}

/**
 * Hono context variables
 */
export interface Variables {
    db: DrizzleD1Database<typeof schema>;
}

/**
 * App type for Hono with proper bindings
 */
export type AppEnv = {
    Bindings: Env;
    Variables: Variables;
};
