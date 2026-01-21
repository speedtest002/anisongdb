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
 * GET /song/search
 * parram: name
 */
songRoutes.get('/search', async (c) => {
    const songName = c.req.query('name')?.trim() || '';

    if (songName.length === 0) {
        return c.json([]);
    }
    try {
        console.log(songName);
        let results: SongFullMat[];
        const [isShort, nameNormalied] = normalizeName(songName);
        if (isShort) {
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
                        eq(songShortNames.nameNormalized, nameNormalied),
                    ),
                )
                .execute();
        } else {
            results = await c.var.db
                .select({ ...getTableColumns(songFullMat) })
                .from(songFullMat)
                .innerJoin(songSearch, eq(songSearch.rowid, songFullMat.songId))
                .where(
                    sql`song_search MATCH ${`name:"${songName}" OR name_normalized:"${nameNormalied}"`}`,
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
