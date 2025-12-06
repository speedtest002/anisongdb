import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Anime, ApiResponse } from '@anisongdb/shared';

// Type definition for Cloudflare bindings
interface Env {
    DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use('*', cors());

// Health check
app.get('/', (c) => {
    return c.json({
        message: 'AnisongDB API is running',
        version: '0.0.1',
    });
});

// Example: Get all anime (paginated)
app.get('/anime', async (c) => {
    try {
        const limit = Number(c.req.query('limit')) || 20;
        const offset = Number(c.req.query('offset')) || 0;

        const results = await c.env.DB.prepare(
            'SELECT * FROM anime LIMIT ? OFFSET ?'
        )
            .bind(limit, offset)
            .all<Anime>();

        const response: ApiResponse<Anime[]> = {
            success: true,
            data: results.results,
        };

        return c.json(response);
    } catch (error) {
        console.error('Database error:', error);
        return c.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            } satisfies ApiResponse<never>,
            500
        );
    }
});

export default app;
