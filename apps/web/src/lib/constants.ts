export const ENDPOINTS = {
    SONG: {
        SEARCH: '/song/search',
        GET_BY_ID: (id: number) => `/song/${id}`,
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
    },
} as const;

export const APP_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 20,
} as const;
