import { Hono } from 'hono';
import { sql, eq, or, getTableColumns } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import {
    songFullMat,
    animeSearch,
    animeShortNames,
    type SongFullMat,
} from '../db/schema.js';
import { normalizeName } from '../utils/normalize.js';
import { escapeFTS } from '../utils/escapefts.js';
import { transformSongFullMat } from '../utils/transform.js';
import { dailyCache } from '../middleware/index.js';
import type { AnimeSearchQuery, Song } from '@anisongdb/shared';

const animeRoutes = new Hono<AppEnv>();

/**
 * GET /anime
 * param: annId
 */
animeRoutes.get('/', dailyCache(6), async (c) => {
    const query: AnimeSearchQuery = c.req.query();
    const annId = Number(query.annId);
    if (isNaN(annId)) {
        return c.json({ error: 'Invalid annId' }, 400);
    }

    try {
        const result = await c.var.db
            .select()
            .from(songFullMat)
            .where(eq(songFullMat.annId, annId))
            .all();

        const response: Song[] = result.map(transformSongFullMat);
        return c.json(response);
    } catch (error) {
        console.error('Anime fetch error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /anime/search
 * param: name
 */
animeRoutes.get('/search', dailyCache(6), async (c) => {
    const query: AnimeSearchQuery = c.req.query();
    const name = query.name?.trim() || '';
    if (name.length === 0) return c.json([]);

    try {
        const [isShort, nameNormalized] = normalizeName(name);
        const safeNorm = escapeFTS(nameNormalized);
        const safeRaw = escapeFTS(name);
        const ftsQuery = `name:"${safeRaw}" OR name_normalized:"${safeNorm}"`;

        const queryShort = c.var.db
            .select({
                ...getTableColumns(songFullMat),
                sortKey: sql<number>`0`.as('sort_key'),
                rank: sql<number>`0`.as('rank'),
            })
            .from(songFullMat)
            .innerJoin(
                animeShortNames,
                eq(animeShortNames.annId, songFullMat.annId),
            )
            .where(
                or(
                    eq(animeShortNames.name, name),
                    eq(animeShortNames.nameNormalized, nameNormalized),
                ),
            );
        const queryLong = c.var.db
            .select({
                ...getTableColumns(songFullMat),
                sortKey: sql<number>`1`.as('sort_key'),
                rank: sql<number>`rank`.as('rank'),
            })
            .from(songFullMat)
            .innerJoin(animeSearch, eq(animeSearch.annId, songFullMat.annId))
            .where(sql`anime_search MATCH ${ftsQuery}`);

        const results = await queryShort
            .union(queryLong)
            .orderBy(sql`sort_key`, sql`rank`)
            .all();

        const response: Song[] = results.map(transformSongFullMat);
        return c.json(response);
    } catch (error) {
        console.error('Search error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export { animeRoutes };
