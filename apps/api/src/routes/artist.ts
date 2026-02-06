import { Hono } from 'hono';
import { sql, eq, or, getTableColumns } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import {
    songFullMat,
    artistSearch,
    artistShortNames,
    type SongFullMat,
} from '../db/schema.js';
import { normalizeName } from '../utils/normalize.js';
import { escapeFTS } from '../utils/escapefts.js';
import { transformSongFullMat } from '../utils/transform.js';
import { dailyCache } from '../middleware/index.js';
import type { Song } from '@anisongdb/shared';

const artistRoutes = new Hono<AppEnv>();

/**
 * GET /artist
 * param: artistId
 */
artistRoutes.get('/', dailyCache(6), async (c) => {
    const artistId = Number(c.req.query('artistId'));

    if (isNaN(artistId)) {
        return c.json({ error: 'Invalid artistId' }, 400);
    }

    try {
        const result = await c.var.db
            .select()
            .from(songFullMat)
            .where(eq(songFullMat.songArtistId, artistId))
            .all();

        const response: Song[] = result.map(transformSongFullMat);
        return c.json(response);
    } catch (error) {
        console.error('Artist fetch error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /artist/search
 * param: name
 */
artistRoutes.get('/search', dailyCache(6), async (c) => {
    const name = c.req.query('name')?.trim() || '';
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
                artistShortNames,
                eq(artistShortNames.artistId, songFullMat.songArtistId),
            )
            .where(
                or(
                    eq(artistShortNames.name, name),
                    eq(artistShortNames.nameNormalized, nameNormalized),
                ),
            );
        const queryLong = c.var.db
            .select({
                ...getTableColumns(songFullMat),
                sortKey: sql<number>`1`.as('sort_key'),
                rank: sql<number>`rank`.as('rank'),
            })
            .from(songFullMat)
            .innerJoin(artistSearch, eq(artistSearch.rowid, songFullMat.songArtistId))
            .where(sql`artist_search MATCH ${ftsQuery}`);

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

export { artistRoutes };
