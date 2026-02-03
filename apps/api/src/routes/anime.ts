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

const animeRoutes = new Hono<AppEnv>();

/**
 * GET /anime
 * param: annId
 */
animeRoutes.get('/', dailyCache(6), async (c) => {
    const annId = Number(c.req.query('annId'));

    if (isNaN(annId)) {
        return c.json({ error: 'Invalid annId' }, 400);
    }

    try {
        const result = await c.var.db
            .select()
            .from(songFullMat)
            .where(eq(songFullMat.annId, annId))
            .execute();

        const response = result.map(transformSongFullMat);
        return c.json(response);
    } catch (error) {
        console.error('Anime fetch error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /anime/search
 * parram: name
 */
animeRoutes.get('/search', dailyCache(6), async (c) => {
    const rawName = c.req.query('name')?.trim() || '';
    if (rawName.length === 0) return c.json([]);

    try {
        let results: SongFullMat[];
        const [isShort, nameNormalized] = normalizeName(rawName);
        if (isShort) {
            results = await c.var.db
                .select({ ...getTableColumns(songFullMat) })
                .from(songFullMat)
                .innerJoin(
                    animeShortNames,
                    eq(animeShortNames.annId, songFullMat.annId),
                )
                .where(
                    or(
                        eq(animeShortNames.name, rawName),
                        eq(animeShortNames.nameNormalized, nameNormalized),
                    ),
                )
                .all();
        } else {
            const safeNorm = escapeFTS(nameNormalized);
            const safeRaw = escapeFTS(rawName);
            const ftsQuery = `name:"${safeRaw}" OR name_normalized:"${safeNorm}"`;
            results = await c.var.db
                .select({ ...getTableColumns(songFullMat) })
                .from(songFullMat)
                .innerJoin(
                    animeSearch,
                    eq(animeSearch.annId, songFullMat.annId),
                )
                .where(sql`anime_search MATCH ${ftsQuery}`)
                .groupBy(songFullMat.annSongId)
                .orderBy(songFullMat.annId, songFullMat.annSongId)
                .all();
        }

        const response = results.map(transformSongFullMat);
        return c.json(response);
    } catch (error) {
        console.error('Search error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export { animeRoutes };
