import { Hono } from 'hono';
import { sql, eq, or, and, getTableColumns } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import {
    songFullMat,
    songSearch,
    songShortNames,
    type SongFullMat,
} from '../db/schema.js';
import { normalizeName } from '../utils/normalize.js';
import { SearchRequest } from '@anisongdb/shared';

const songRoutes = new Hono<AppEnv>();

// Get single song by annSongId
songRoutes.get('/annSongId/:annSongId', async (c) => {
    const annSongId = Number(c.req.param('annSongId'));

    const result = await c.var.db
        .select()
        .from(songFullMat)
        .where(eq(songFullMat.annSongId, annSongId))
        .execute();

    const response = result.map((song) => ({
        ...song,
        animeGenres: song.animeGenres?.split('|') ?? [],
        animeTags: song.animeTags?.split('|') ?? [],
        animeAltNames: song.animeAltNames?.split('|') ?? [],
    }));
    return c.json(response);
});

/**
 * POST /song/search
 */
songRoutes.post('/search', async (c) => {
    const body: SearchRequest = await c.req.json();
    const songName = body.songNameSearchFilter?.search?.trim() || '';

    if (songName.length === 0) {
        return c.json([]);
    }
    try {
        let results: SongFullMat[];
        const normalizedName = normalizeName(songName);
        if (normalizedName.isShort) {
            results = await c.var.db
                .select({ ...getTableColumns(songFullMat) })
                .from(songFullMat)
                .innerJoin(
                    songShortNames,
                    eq(songShortNames.songId, songFullMat.songId),
                )
                .where(
                    or(
                        eq(songShortNames.name, songName),
                        eq(songShortNames.nameNormalized, normalizedName.name),
                    ),
                )
                .execute();
        } else {
            results = await c.var.db
                .select({ ...getTableColumns(songFullMat) })
                .from(songFullMat)
                .innerJoin(songSearch, eq(songSearch.rowid, songFullMat.songId))
                .where(
                    sql`song_search MATCH ${`name:"${songName}" OR name_normalized:"${normalizedName.name}"`}`,
                )
                .execute();
        }

        const response = results.map((song) => ({
            ...song,
            animeGenres: song.animeGenres?.split('|') ?? [],
            animeTags: song.animeTags?.split('|') ?? [],
            animeAltNames: song.animeAltNames?.split('|') ?? [],
        }));
        return c.json(response);
    } catch (error) {
        console.error('lỗi: ', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export { songRoutes };
