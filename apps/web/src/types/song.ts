export interface SongResult {
    annId: number;
    annSongId: number;
    animeNameEn: string;
    animeNameJa: string;
    songName: string;
    songArtist: string;
    songTypeName: string;
    songComposer: string;
    songArranger: string;
    difficulty: number;
    hq: string;
    audio: string;
}

export interface SongDetail extends SongResult {
    // Add more fields if needed for a "single song" view
    animeYear?: number;
    animeType?: string;
    songArtistId?: number;
}
