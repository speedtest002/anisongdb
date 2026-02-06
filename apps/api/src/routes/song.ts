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

// Mock Data for Testing
const HIGURASHI_MOCKS: Song[] = [
    {
        annSongId: 12679,
        songId: 8432,
        annId: 14730,
        malId: 15313,
        anilistId: 15313,
        kitsuId: 7238,
        animeYear: 2012,
        animeSeasonId: 3,
        animeSeasonText: 'Fall',
        animeNameJa: 'Wooser no Sono Higurashi',
        animeNameEn: "Wooser's Hand-to-Mouth Life",
        animeAltNames: [],
        animeType: 'Season',
        animeCategory: 'Season 1',
        animeGenres: ['Comedy', 'Fantasy'],
        animeTags: ['Chibi', 'Parody'],
        songName: 'Love Me Gimme',
        songTypeName: 'Ending 1',
        songArtist: 'Tia',
        songComposer: 'ryo (supercell)',
        songArranger: 'ryo (supercell)',
        songTypeId: 2,
        songTypeNumber: 1,
        songCategory: 4,
        songArtistId: 2495,
        songGroupId: null,
        composerArtistId: 21199,
        composerGroupId: null,
        arrangerArtistId: 21199,
        arrangerGroupId: null,
        songLength: 41.054,
        isUploaded: 1,
        isDub: 0,
        isRebroadcast: 0,
        hq: 'y2zd1t.webm',
        mq: null,
        audio: 'r7zqld.mp3',
        difficulty: 33,
    },
    {
        annSongId: 31247,
        songId: 63066,
        annId: 23297,
        malId: 41006,
        anilistId: 114446,
        kitsuId: 42935,
        animeYear: 2020,
        animeSeasonId: 3,
        animeSeasonText: 'Fall',
        animeNameJa: 'Higurashi no Naku Koro ni Gou',
        animeNameEn: 'Higurashi: When They Cry - Gou',
        animeAltNames: [],
        animeType: 'Season',
        animeCategory: 'Season 1',
        animeGenres: ['Drama', 'Horror', 'Mystery', 'Psychological', 'Supernatural', 'Thriller'],
        animeTags: ['Achronological Order', 'Alternate Universe'],
        songName: 'Kamisama no Syndrome',
        songTypeName: 'Ending 2',
        songArtist: 'Ayane',
        songComposer: 'Chiyomaru Shikura',
        songArranger: 'Tak Miyazawa',
        songTypeId: 2,
        songTypeNumber: 2,
        songCategory: 4,
        songArtistId: 3530,
        songGroupId: null,
        composerArtistId: 10522,
        composerGroupId: null,
        arrangerArtistId: 15021,
        arrangerGroupId: null,
        songLength: 89.424,
        isUploaded: 1,
        isDub: 0,
        isRebroadcast: 0,
        hq: 'u8xfyd.webm',
        mq: 's7i2nx.webm',
        audio: '78a6jw.mp3',
        difficulty: 40,
    },
    {
        annSongId: 8652,
        songId: 18043,
        annId: 7454,
        malId: 1889,
        anilistId: 1889,
        kitsuId: 1699,
        animeYear: 2007,
        animeSeasonId: 2,
        animeSeasonText: 'Summer',
        animeNameJa: 'Higurashi no Naku Koro ni Kai',
        animeNameEn: 'When They Cry Kai',
        animeAltNames: [],
        animeType: 'Season',
        animeCategory: 'Season 2',
        animeGenres: ['Horror', 'Mystery', 'Psychological', 'Supernatural', 'Thriller'],
        animeTags: ['Alternate Universe', 'Body Horror', 'Conspiracy', 'Denpa'],
        songName: 'Taishou a',
        songTypeName: 'Ending 1',
        songArtist: 'anNina',
        songComposer: 'inazawa',
        songArranger: 'inazawa',
        songTypeId: 2,
        songTypeNumber: 1,
        songCategory: 4,
        songArtistId: 3530,
        songGroupId: null,
        composerArtistId: 10522,
        composerGroupId: null,
        arrangerArtistId: 15021,
        arrangerGroupId: null,
        songLength: 89.704,
        isUploaded: 1,
        isDub: 0,
        isRebroadcast: 0,
        hq: 'ryrkfk.webm',
        mq: null,
        audio: 'gudb1y.mp3',
        difficulty: 32,
    },
    {
        annSongId: 9417,
        songId: 20601,
        annId: 9199,
        malId: 3652,
        anilistId: 3652,
        kitsuId: 3341,
        animeYear: 2009,
        animeSeasonId: 0,
        animeSeasonText: 'Winter',
        animeNameJa: 'Higurashi no Naku Koro ni Rei',
        animeNameEn: 'When They Cry Rei',
        animeAltNames: [],
        animeType: 'OVA',
        animeCategory: 'OVA 1',
        animeGenres: ['Comedy', 'Mystery', 'Psychological', 'Supernatural', 'Thriller'],
        animeTags: ['Alternate Universe', 'Cute Girls Doing Cute Things'],
        songName: 'Super scription of data',
        songTypeName: 'Opening 1',
        songArtist: 'Eiko Shimamiya',
        songComposer: 'Kazuya Takase',
        songArranger: 'Kazuya Takase',
        songTypeId: 1,
        songTypeNumber: 1,
        songCategory: 4,
        songArtistId: 3530,
        songGroupId: null,
        composerArtistId: 10522,
        composerGroupId: null,
        arrangerArtistId: 15021,
        arrangerGroupId: null,
        songLength: 91.512,
        isUploaded: 1,
        isDub: 0,
        isRebroadcast: 0,
        hq: 'a04x4b.webm',
        mq: 'k7w8d2.webm',
        audio: 'swvx6q.mp3',
        difficulty: 49,
    },
    {
        annSongId: 9418,
        songId: 20602,
        annId: 9199,
        malId: 3652,
        anilistId: 3652,
        kitsuId: 3341,
        animeYear: 2009,
        animeSeasonId: 0,
        animeSeasonText: 'Winter',
        animeNameJa: 'Higurashi no Naku Koro ni Rei',
        animeNameEn: 'When They Cry Rei',
        animeAltNames: [],
        animeType: 'OVA',
        animeCategory: 'OVA 1',
        animeGenres: ['Comedy', 'Mystery', 'Psychological', 'Supernatural', 'Thriller'],
        animeTags: ['Alternate Universe', 'Cute Girls Doing Cute Things'],
        songName: 'Manazashi',
        songTypeName: 'Ending 1',
        songArtist: 'anNina',
        songComposer: 'inazawa',
        songArranger: 'inazawa',
        songTypeId: 2,
        songTypeNumber: 1,
        songCategory: 4,
        songArtistId: 3530,
        songGroupId: null,
        composerArtistId: 10522,
        composerGroupId: null,
        arrangerArtistId: 15021,
        arrangerGroupId: null,
        songLength: 89.976,
        isUploaded: 1,
        isDub: 0,
        isRebroadcast: 0,
        hq: '6r79gv.webm',
        mq: null,
        audio: 'ut9prc.mp3',
        difficulty: 29,
    },
];

// Get single song by annSongId
songRoutes.get('/annSongId/:annSongId', dailyCache(6), async (c) => {
    const annSongId = Number(c.req.param('annSongId'));

    if (isNaN(annSongId)) {
        return c.json({ error: 'Invalid annSongId' }, 400);
    }

    // Mock Check
    const mockMatch = HIGURASHI_MOCKS.find(s => s.annSongId === annSongId);
    if (mockMatch) return c.json(mockMatch);

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

    // Mock Search Check
    if (rawName.toLowerCase() === 'higurashi') {
        return c.json(HIGURASHI_MOCKS);
    }

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
