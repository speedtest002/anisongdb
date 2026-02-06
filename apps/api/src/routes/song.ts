import { Hono } from 'hono';
import { sql, eq, or, getTableColumns } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import {
    songFullMat,
    songSearch,
    songShortNames,
    type SongFullMat,
} from '../db/schema.js';
import { normalizeName } from '../utils/normalize.js';
import { escapeFTS } from '../utils/escapefts.js';
import { transformSongFullMat } from '../utils/transform.js';
import { dailyCache } from '../middleware/index.js';
import type { Song } from '@anisongdb/shared';

const songRoutes = new Hono<AppEnv>();

// Get single song by annSongId
songRoutes.get('/annSongId/:annSongId', dailyCache(6), async (c) => {
    const annSongId = Number(c.req.param('annSongId'));

    if (isNaN(annSongId)) {
        return c.json({ error: 'Invalid annSongId' }, 400);
    }

    try {
        const result = await c.var.db
            .select()
            .from(songFullMat)
            .where(eq(songFullMat.annSongId, annSongId))
            .get();

        if (!result) {
            return c.json(null);
        }

        const response: Song = transformSongFullMat(result);
        return c.json(response);
    } catch (error) {
        console.error('Song fetch error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /song/search
 * param: name
 */
songRoutes.get('/search', dailyCache(6), async (c) => {
    const rawName = c.req.query('name')?.trim() || '';
    if (rawName.length === 0) return c.json([]);

    try {
        const [isShort, nameNormalized] = normalizeName(rawName);
        const safeNorm = escapeFTS(nameNormalized);
        const safeRaw = escapeFTS(rawName);
        const ftsQuery = `name:"${safeRaw}" OR name_normalized:"${safeNorm}"`;

        const queryShort = c.var.db
            .select({
                ...getTableColumns(songFullMat),
                sortKey: sql<number>`0`.as('sort_key'),
                rank: sql<number>`0`.as('rank'),
            })
            .from(songFullMat)
            .innerJoin(
                songShortNames,
                eq(songShortNames.songId, songFullMat.songId),
            )
            .where(
                or(
                    eq(songShortNames.name, rawName),
                    eq(songShortNames.nameNormalized, nameNormalized),
                ),
            );
        const queryLong = c.var.db
            .select({
                ...getTableColumns(songFullMat),
                sortKey: sql<number>`1`.as('sort_key'),
                rank: sql<number>`rank`.as('rank'),
            })
            .from(songFullMat)
            .innerJoin(songSearch, eq(songSearch.rowid, songFullMat.songId))
            .where(sql`song_search MATCH ${ftsQuery}`);

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

export { songRoutes };
