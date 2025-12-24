// packages/shared/src/db-schema.ts
import { Generated, ColumnType } from 'kysely';

// --- Tables ---

/**
 * @property artistId -
 * @property name -
 */
export interface ArtistTable {
    artistId: number;
    name: string;
}

/**
 * @property artistId -
 * @property altId -
 */
export interface ArtistAltNameTable {
    artistId: number;
    altId: number;
}

/**
 * @property annId -
 * @property malId -
 * @property kitsuId -
 * @property anilistId -
 */
export interface AnimeListTable {
    annId: number;
    malId: number;
    kitsuId: number | null;
    anilistId: number | null;
}

/**
 * @property annId -
 * @property genreName -
 */
export interface AnimeGenreTable {
    annId: number;
    genreName: string;
}

/**
 * @property annId -
 * @property tagName -
 */
export interface AnimeTagTable {
    annId: number;
    tagName: string;
}

/**
 * @property annSongId -
 * @property difficulty -
 * @property hq -
 * @property mq -
 * @property audio -
 * @property length -
 */
export interface SongUrlsTable {
    annSongId: number;
    difficulty: number | null;
    hq: string | null;
    mq: string | null;
    audio: string | null;
    length: number | null;
}

/**
 * @property groupId -
 * @property name -
 */
export interface GroupsTable {
    groupId: number;
    name: string;
}

/**
 * @property mainGroupId -
 * @property altGroupId -
 */
export interface GroupAltNameTable {
    mainGroupId: number;
    altGroupId: number;
}

/**
 * @property artistId -
 * @property groupId -
 */
export interface GroupArtistTable {
    artistId: number;
    groupId: number;
}

/**
 * @property parentGroupId -
 * @property childGroupId -
 */
export interface GroupGroupTable {
    parentGroupId: number;
    childGroupId: number;
}

/**
 * @property songId -
 * @property name - song name
 * @property songArtistId - artist id (artist)
 * @property composerArtistId - composer id (artist)
 * @property arrangerArtistId - arranger id (artist)
 * @property songGroupId - artist id (group)
 * @property composerGroupId - composer id (group)
 * @property arrangerGroupId - arranger id (group)
 * @property category - song category:
 *  - 0: ??? @ DatabaseMods pls
 *  - 1: instrumental
 *  - 2: chanting
 *  - 3: character
 *  - 4: standard
 */
export interface SongTable {
    songId: number;
    name: string | null;
    songArtistId: number | null;
    composerArtistId: number | null;
    arrangerArtistId: number | null;
    songGroupId: number | null;
    composerGroupId: number | null;
    arrangerGroupId: number | null;
    category: 0 | 1 | 2 | 3 | 4;
}

/**
 * song_links table
 * @property annSongId - each entry song has unique annSongId
 * @property songId - each song (same entry) has unique songId
 * @property annId - Animenewsnetwork id
 * @property number - 1, 2, 3 (OP1, ED2,...)
 * @property type -
 *  - 1 = 'OP'
 *  - 2 = 'ED'
 *  - 3 = 'IN'
 * @property uploaded -
 *  - 1 = uploaded
 *  - 0 = not uploaded
 * @property rebroadcast -
 *  - 1 = rebroadcast
 *  - 0 = not rebroadcast
 * @property dub - 1 = dub, 0 = not dub
 */
export interface SongLinksTable {
    annSongId: number;
    songId: number;
    annId: number;
    number: number;
    type: 1 | 2 | 3;
    uploaded: 0 | 1;
    rebroadcast: 0 | 1;
    dub: 0 | 1;
}

/**
 * @property annId -
 * @property category -
 *  - OVA
 *  - Movie
 *  - Season
 *  - TV Special
 *  - ONA
 *  - Music Video
 *  - Game Cutscene Compilation
 *  - Doujin
 * @property categoryNumber - (season) 1, 2, 3,... or (movie) 2023,...
 * @property year - year
 * @property seasonId - season id:
 *  - 0 = Winter
 *  - 1 = Spring
 *  - 2 = Summer
 *  - 3 = Fall
 */
export interface AnimeTable {
    annId: number;
    category: string;
    categoryNumber: number | null;
    year: number;
    seasonId: 0 | 1 | 2 | 3;
}

/**
 * @property annId -
 * @property language - JA / EN
 * @property name - anime name
 * @property isMain - 1 = main, 0 = alternative name
 */
export interface AnimeNamesTable {
    annId: number;
    language: 'JA' | 'EN';
    name: string;
    isMain: 0 | 1;
}

/**
 * Materialized table for song search - denormalized for fast read
 * @see create_mat.sql for the SQL definition
 */
export interface SongFullMatTable {
    // --- PRIMARY KEY ---
    annSongId: number;

    // --- FOREIGN KEYS ---
    songId: number;
    annId: number;
    malId: number | null;
    anilistId: number | null;
    kitsuId: number | null;

    // --- ANIME INFO (FILTER & SORT) ---
    animeYear: number;
    animeSeasonId: 0 | 1 | 2 | 3;

    // --- ANIME INFO (DISPLAY) ---
    animeSeasonText: 'Winter' | 'Spring' | 'Summer' | 'Fall';
    animeNameJa: string | null;
    animeNameEn: string | null;
    animeAltNames: string | null;
    animeType: string;
    animeCategory: string;

    // --- ANIME METADATA (pipe-separated) ---
    animeGenres: string | null;
    animeTags: string | null;

    // --- SONG INFO (DISPLAY) ---
    songName: string | null;
    songTypeName: string;
    songArtist: string | null;
    songComposer: string | null;
    songArranger: string | null;

    // --- SONG INFO (RAW DATA) ---
    songTypeId: 1 | 2 | 3;
    songTypeNumber: number;
    songCategory: 0 | 1 | 2 | 3 | 4; // 0 = Unknown, 1 = Instrumental, 2 = Chanting, 3 = Character, 4 = Standard
    // --- ARTIST/GROUP IDs (FOR FILTERING BY ROLE) ---
    songArtistId: number | null;
    songGroupId: number | null;
    composerArtistId: number | null;
    composerGroupId: number | null;
    arrangerArtistId: number | null;
    arrangerGroupId: number | null;

    // --- FILES & ATTRIBUTES ---
    songLength: number | null;
    isUploaded: 0 | 1;
    isDub: 0 | 1;
    isRebroadcast: 0 | 1;
    hq: string | null;
    mq: string | null;
    audio: string | null;
    difficulty: number | null;
}

// ================================================================
// FTS5 Virtual Tables for Full-Text Search
// ================================================================

/**
 * FTS5 Virtual Table for Anime Search
 * @property rowid - Auto-generated by FTS5 (NOT mapped from anime_names)
 * @property name - Anime name (indexed for full-text search)
 * @property annId - Reference to anime.annId (UNINDEXED)
 * @note Multiple rows can have same annId (different names for same anime)
 * @note anime_names has composite PK, so we can't use rowid mapping
 */
export interface AnimeSearchTable {
    rowid: number;
    name: string;
    annId: number;
}

/**
 * FTS5 Virtual Table for Song Search
 * @property rowid - Maps to song.songId (Primary Key)
 * @property name - Song name (indexed for full-text search)
 * @note rowid IS the songId, so no separate songId column needed
 */
export interface SongSearchTable {
    rowid: number;
    name: string | null;
}

/**
 * FTS5 Virtual Table for Artist Search
 * @property rowid - Maps to artist.artistId (Primary Key)
 * @property name - Artist name (indexed for full-text search)
 * @note rowid IS the artistId, so no separate artistId column needed
 */
export interface ArtistSearchTable {
    rowid: number;
    name: string;
}

/**
 * FTS5 Virtual Table for Group Search
 * @property rowid - Maps to groups.groupId (Primary Key)
 * @property name - Group name (indexed for full-text search)
 * @note rowid IS the groupId, so no separate groupId column needed
 */
export interface GroupSearchTable {
    rowid: number;
    name: string;
}

// --- Database Interface ---

export interface Database {
    artist: ArtistTable;
    artistAltName: ArtistAltNameTable;
    animeList: AnimeListTable;
    animeGenre: AnimeGenreTable;
    animeTag: AnimeTagTable;
    songUrls: SongUrlsTable;
    groups: GroupsTable;
    groupAltName: GroupAltNameTable;
    groupArtist: GroupArtistTable;
    groupGroup: GroupGroupTable;
    song: SongTable;
    songLinks: SongLinksTable;
    anime: AnimeTable;
    animeNames: AnimeNamesTable;
    songFullMat: SongFullMatTable;

    // FTS5 Virtual Tables
    animeSearch: AnimeSearchTable;
    songSearch: SongSearchTable;
    artistSearch: ArtistSearchTable;
    groupSearch: GroupSearchTable;
}
