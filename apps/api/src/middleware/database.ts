import type { MiddlewareHandler } from 'hono';
import { Kysely, CamelCasePlugin } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '@anisongdb/shared';
import type { Env, Variables } from '../types.js';

/**
 * Database middleware - Initializes Kysely with D1 and CamelCasePlugin
 * Converts snake_case columns to camelCase in TypeScript
 */
export const databaseMiddleware: MiddlewareHandler<{
    Bindings: Env;
    Variables: Variables;
}> = async (c, next) => {
    const db = new Kysely<Database>({
        dialect: new D1Dialect({ database: c.env.DB }),
        plugins: [new CamelCasePlugin()],
    });
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
    const db = new Kysely<Database>({
        dialect: new D1Dialect({ database: c.env.DB }),
        plugins: [new CamelCasePlugin()],
        log(event) {
            if (event.level === 'query') {
                console.log('Query:', event.query.sql);
                console.log('Parameters:', event.query.parameters);
                console.log('Duration:', event.queryDurationMillis, 'ms');
            }
            if (event.level === 'error') {
                console.error('Query Error:', event.error);
            }
        },
    });
    c.set('db', db);
    await next();
};
