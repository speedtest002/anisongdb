/**
 * Query parameters for song search
 */
export interface SongSearchQuery {
    annSongId?: number;
    name?: string;
}

/**
 * Query parameters for anime search
 */
export interface AnimeSearchQuery {
    annId?: number;
    name?: string;
}

export interface SearchRequest {
    songNameSearchFilter: {
        search: string;
        partialMatch: boolean;
    };
    andLogic: boolean;
    ignoreDuplicate: boolean;
    openingFilter: boolean;
    endingFilter: boolean;
    insertFilter: boolean;
    normalBroadcast: boolean;
    dub: boolean;
    rebroadcast: boolean;
    standard: boolean;
    instrumental: boolean;
    chanting: boolean;
    character: boolean;
}
