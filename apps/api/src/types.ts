import type { Kysely } from 'kysely';
import type { Database } from '@anisongdb/shared';

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
    db: Kysely<Database>;
}

/**
 * App type for Hono with proper bindings
 */
export type AppEnv = {
    Bindings: Env;
    Variables: Variables;
};
