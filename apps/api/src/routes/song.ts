import { Hono } from 'hono';
import { sql, eq, getTableColumns } from 'drizzle-orm';
import type { AppEnv } from '../types.js';
import {
    songFullMat,
    songSearch,
    type SongFullMat,
} from '../db/schema.js';
import { buildRegexReplaced } from '../utils/search-regex.js';
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
    const name = body.songNameSearchFilter?.search?.trim() || '';

    if (name.length === 0) {
        return c.json([]);
    }
    try {
        // apply ANIME_REGEX_REPLACE_RULES
        const nameRegexReplaced = buildRegexReplaced(name);
        console.log(nameRegexReplaced);
        const results: SongFullMat[] = await c.var.db
            .select({ ...getTableColumns(songFullMat) })
            .from(songFullMat)
            .innerJoin(songSearch, eq(songSearch.rowid, songFullMat.songId))
            .where(sql`song_search.name MATCH ${nameRegexReplaced}`)
            .execute();

        // filters
        let filtered = results;

        // if dub=false, remove dub songs
        if (!body.dub) {
            filtered = filtered.filter((song) => song.isDub !== 1);
        }

        // broadcast type
        if (body.normalBroadcast && !body.rebroadcast) {
            // Only normal broadcast (exclude rebroadcast)
            filtered = filtered.filter((song) => song.isRebroadcast === 0);
        } else if (!body.normalBroadcast && body.rebroadcast) {
            // Only rebroadcast
            filtered = filtered.filter((song) => song.isRebroadcast === 1);
        }
        // If both true or both false → no filter

        // song type
        const selectedTypes: (1 | 2 | 3)[] = [];
        if (body.openingFilter) selectedTypes.push(1);
        if (body.endingFilter) selectedTypes.push(2);
        if (body.insertFilter) selectedTypes.push(3);
        if (selectedTypes.length > 0 && selectedTypes.length < 3) {
            filtered = filtered.filter((song) =>
                selectedTypes.includes(song.songTypeId as 1 | 2 | 3),
            );
        }

        // song category
        const selectedCategories: (1 | 2 | 3 | 4)[] = [];
        if (body.instrumental) selectedCategories.push(1);
        if (body.chanting) selectedCategories.push(2);
        if (body.character) selectedCategories.push(3);
        if (body.standard) selectedCategories.push(4);
        if (selectedCategories.length > 0 && selectedCategories.length < 4) {
            filtered = filtered.filter((song) =>
                selectedCategories.includes(song.songCategory as 1 | 2 | 3 | 4),
            );
        }

        // remove duplicates by songId if ignoreDuplicate is true
        if (body.ignoreDuplicate) {
            const seen = new Set<number>();
            filtered = filtered.filter((song) => {
                if (seen.has(song.songId)) return false;
                seen.add(song.songId);
                return true;
            });
        }

        // Transform pipe-separated strings to arrays
        const response = filtered.map((song) => ({
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
