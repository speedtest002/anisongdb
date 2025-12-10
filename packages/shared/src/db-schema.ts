// src/db-schema.ts
import { Generated, ColumnType } from 'kysely';

// --- Tables ---

/**
 * @property artist_id - amq
 * @property name -
 */
export interface ArtistTable {
    artist_id: number;
    name: string;
}

/**
 * @property artist_id -
 * @property alt_id -
 */
export interface ArtistAltNameTable {
    artist_id: number;
    alt_id: number;
}

/**
 * @property ann_id -
 * @property mal_id -
 * @property kitsu_id -
 * @property anilist_id -
 */
export interface AnimeListTable {
    ann_id: number;
    mal_id: number;
    kitsu_id: number | null;
    anilist_id: number | null;
}

/**
 * @property ann_id -
 * @property genre_name -
 */
export interface AnimeGenreTable {
    ann_id: number;
    genre_name: string;
}

/**
 * @property ann_id -
 * @property tag_name -
 */
export interface AnimeTagTable {
    ann_id: number;
    tag_name: string;
}

/**
 * @property ann_song_id -
 * @property difficulty -
 * @property hq -
 * @property mq -
 * @property audio -
 * @property length -
 */
export interface SongUrlsTable {
    ann_song_id: number;
    difficulty: number | null;
    hq: string | null;
    mq: string | null;
    audio: string | null;
    length: number | null;
}

/**
 * @property group_id -
 * @property name -
 */
export interface GroupsTable {
    group_id: number;
    name: string;
}

/**
 * @property main_group_id -
 * @property alt_group_id -
 */
export interface GroupAltNameTable {
    main_group_id: number;
    alt_group_id: number;
}

/**
 * @property artist_id -
 * @property group_id -
 */
export interface GroupArtistTable {
    artist_id: number;
    group_id: number;
}

/**
 * @property parent_group_id -
 * @property child_group_id -
 */
export interface GroupGroupTable {
    parent_group_id: number;
    child_group_id: number;
}

/**
 * @property song_id -
 * @property name - song name
 * @property song_artist_id - artist id (artist)
 * @property composer_artist_id - composer id (artist)
 * @property arranger_artist_id - arranger id (artist)
 * @property song_group_id - artist id (group)
 * @property composer_group_id - composer id (group)
 * @property arranger_group_id - arranger id (group)
 * @property category - song category:
 *  - 0: ??? @ DatabaseMods pls
 *  - 1: instrumental
 *  - 2: chanting
 *  - 3: character
 *  - 4: standard
 */
export interface SongTable {
    song_id: number;
    name: string | null;
    song_artist_id: number | null;
    composer_artist_id: number | null;
    arranger_artist_id: number | null;
    song_group_id: number | null;
    composer_group_id: number | null;
    arranger_group_id: number | null;
    category: number;
}

/**
 * song_links table
 * @property ann_song_id - each entry song has unique ann_song_id
 * @property song_id - each song (same entry) has unique song_id
 * @property ann_id - Animenewsnetwork id
 * @property number - 1, 2, 3 (OP1, ED2,...)
 * @property type - 
 *  - 1 = 'OP'
 *  - 2 = 'ED
 *  - 3 = 'IN'
 * @property uploaded - :
 *  - 1 = uploaded
 *  - 0 = not uploaded
 * @property rebroadcast - 
 *  - 1 = rebroadcast
 *  - 0 = not rebroadcast
 * @property dub - 1 = dub, 0 = not dub
 */
export interface SongLinksTable {
    ann_song_id: number;
    song_id: number;
    ann_id: number;
    number: number;
    type: number;
    uploaded: number;
    rebroadcast: number;
    dub: number;
}

/**
 * @property ann_id -
 * @property category -
 *  - OVA
 *  - Movie
 *  - Season
 *  - TV Special
 *  - ONA
 *  - Music Video
 *  - Game Cutscene Compilation
 *  - Doujin
 * @property category_number - (season) 1, 2, 3,... or (movie) 2023,...
 * @property year - year
 * @property season_id - season id:
 *  - 0 = Winter
 *  - 1 = Spring
 *  - 2 = Summer
 *  - 3 = Fall
 */
export interface AnimeTable {
    ann_id: number;
    category: string;
    category_number: number | null;
    year: number;
    season_id: number;
}

/**
 * @property ann_id -
 * @property language - JA / EN
 * @property name - anime name
 * @property is_main - 1 = main, 0 = alternative name
 */
export interface AnimeNamesTable {
    ann_id: number;
    language: string;
    name: string;
    is_main: number;
}

/**
 * @property ann_song_id -
 * @property ann_id -
 * @property mal_id -
 * @property anime_name_ja -
 * @property anime_name_en -
 * @property song_type -
 * @property song_id -
 * @property song_name -
 * @property artist_name -
 * @property composer_name -
 * @property arranger_name -
 * @property rebroadcast -
 * @property dub -
 * @property hq -
 * @property mq -
 * @property audio -
 * @property difficulty -
 * @property length -
 */
export interface SongFullMatTable {
    ann_song_id: number | null;
    ann_id: number | null;
    mal_id: number | null;
    anime_name_ja: string | null;
    anime_name_en: string | null;
    song_type: string | null;
    song_id: number | null;
    song_name: string | null;
    artist_name: string | null;
    composer_name: string | null;
    arranger_name: string | null;
    rebroadcast: number | null;
    dub: number | null;
    hq: string | null;
    mq: string | null;
    audio: string | null;
    difficulty: number | null;
    length: number | null;
}

// --- Database Interface ---

export interface Database {
    artist: ArtistTable;
    artist_alt_name: ArtistAltNameTable;
    anime_list: AnimeListTable;
    anime_genre: AnimeGenreTable;
    anime_tag: AnimeTagTable;
    song_urls: SongUrlsTable;
    groups: GroupsTable;
    group_alt_name: GroupAltNameTable;
    group_artist: GroupArtistTable;
    group_group: GroupGroupTable;
    song: SongTable;
    song_links: SongLinksTable;
    anime: AnimeTable;
    anime_names: AnimeNamesTable;
    song_full_mat: SongFullMatTable;
}
