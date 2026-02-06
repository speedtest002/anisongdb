export const ENDPOINTS = {
    SONG: {
        SEARCH: '/song/search',
        GET_BY_ID: (id: number) => `/song/annSongId/${id}`,
    },
    ANIME: {
        SEARCH: '/anime/search',
    },
    ARTIST: {
        SEARCH: '/artist/search',
    },
    PLAYLIST: {
        LIST: '/playlist',
        GET: (id: string) => `/playlist/${id}`,
        CREATE: '/playlist',
        ADD_SONG: (playlistId: string) => `/playlist/${playlistId}/song`,
        BULK_ADD_SONGS: (playlistId: string) => `/playlist/${playlistId}/songs/bulk`,
    },
} as const;

export const APP_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 20,
} as const;
