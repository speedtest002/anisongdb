import { Hono } from 'hono';
import { sql, inArray } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import type { ApiResponse } from '@anisongdb/shared';
import {
    songFullMat,
    anime,
    type SongFullMat,
    type Anime,
} from '../db/schema.js';
import { applyAnimeRegexRules } from '../utils/search-regex.js';

/**
 * Anime routes
 * Handles all anime-related API endpoints
 */
const animeRoutes = new Hono<AppEnv>();

animeRoutes.post('/annId', async (c) => {
    const body = await c.req.json<{ annId: number[] }>();
    const annId = body.annId;
    console.log(annId);
    if (annId.length === 0) {
        return c.json(
            {
                success: false,
                error: 'No annId provided',
            } satisfies ApiResponse<never>,
            404,
        );
    }

    if (annId.length > 500) {
        return c.json(
            {
                success: false,
                error: 'Too many annId provided',
            } satisfies ApiResponse<never>,
            400,
        );
    }

    const result = await c.var.db
        .select()
        .from(songFullMat)
        .where(inArray(songFullMat.annId, annId))
        .all();

    if (result.length === 0) {
        return c.json(
            {
                success: false,
                error: 'Anime not found',
            } satisfies ApiResponse<never>,
            404,
        );
    }

    const response: ApiResponse<SongFullMat[]> = {
        success: true,
        data: result,
    };

    return c.json(response);
});

// Search anime by name using ANIME_REGEX_REPLACE_RULES for Unicode normalization
animeRoutes.post('/search', async (c) => {
    const body = await c.req.json<{ searchTerm: string }>();
    const searchTerm = body.searchTerm.trim();

    if (searchTerm.length === 0) {
        const response: ApiResponse<Anime[]> = {
            success: true,
            data: [],
        };
        return c.json(response);
    }

    // Apply anime regex rules to create a regex pattern
    const regexPattern = applyAnimeRegexRules(searchTerm);

    // Use REGEXP for matching with the transformed pattern
    const results = await c.var.db
        .select()
        .from(anime)
        .where(sql`anime_name REGEXP ${regexPattern}`)
        .limit(50)
        .all();

    console.log('Results count:', results.length);

    const response: ApiResponse<Anime[]> = {
        success: true,
        data: results,
    };

    return c.json(response);
});

export { animeRoutes };
