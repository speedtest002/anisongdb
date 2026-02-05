export interface Song {
    annSongId: number;
    songId: number;
    annId: number;
    malId: number | null;
    anilistId: number | null;
    kitsuId: number | null;
    animeYear: number | null;
    animeSeasonId: number | null;
    animeSeasonText: string | null;
    animeNameJa: string | null;
    animeNameEn: string | null;
    animeAltNames: string[];
    animeType: string | null;
    animeCategory: string | null;
    animeGenres: string[];
    animeTags: string[];
    songName: string | null;
    songTypeName: string | null;
    songArtist: string | null;
    songComposer: string | null;
    songArranger: string | null;
    songTypeId: number;
    songTypeNumber: number | null;
    songCategory: number | null;
    songArtistId: number | null;
    songGroupId: number | null;
    composerArtistId: number | null;
    composerGroupId: number | null;
    arrangerArtistId: number | null;
    arrangerGroupId: number | null;
    songLength: number | null;
    isUploaded: number; // 0 or 1
    isDub: number; // 0 or 1
    isRebroadcast: number; // 0 or 1
    hq: string | null;
    mq: string | null;
    audio: string | null;
    difficulty: number | null;

    sortKey?: number;
    rank?: number;
}
