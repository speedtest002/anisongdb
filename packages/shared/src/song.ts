export interface SongFull {
    annId: number,
    annSongId: number,
    amqSongId: number,
    animeENName: string,
    animeJPName: string,
    animeAltName: null,
    animeVintage: string,
    linked_ids: {
        myanimelist: number,
        anidb: number,
        anilist: number,
        kitsu: number
    },
    animeType: string,
    animeCategory: string,
    songType: string,
    songName: string,
    songArtist: string,
    songComposer: string,
    songArranger: string,
    songDifficulty: number,
    songCategory: string,
    songLength: number,
    isDub: boolean,
    isRebroadcast: boolean,
    HQ: string | null,
    MQ: string | null,
    audio: string | null,
    artists: [
        {
            id: number,
            names: string,
        }
    ],
    composers: [
        {
            id: number,
            names: string,
        }
    ],
    arrangers: [
        {
            id: number,
            names: string,
        }
    ]
}

export interface SongShort {
    annSongId: number,
    annId: number,
    malId: number,
    animeNameJa: string | null,
    animeNameEn: string | null,
    songType: string,
    songId: number,
    songName: string,
    artistName: string,
    composerName: string | null,
    arrangerName: string | null,
    rebroadcast: number,
    dub: number,
    hq: string | null,
    mq: string | null,
    audio: string | null,
    difficulty: number | null,
    length: number | null
}