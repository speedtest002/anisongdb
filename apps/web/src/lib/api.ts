export const API_BASE_URL = 'http://localhost:8787/api';

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

const MOCK_RESULTS: SongResult[] = [
    {
        annId: 10451,
        annSongId: 1,
        animeNameEn: "A Certain Scientific Railgun",
        animeNameJa: "Toaru Kagaku no Railgun",
        songName: "only my railgun",
        songArtist: "fripSide",
        songTypeName: "OP1",
        songComposer: "Satoshi Yaginuma",
        songArranger: "Satoshi Yaginuma",
        difficulty: 85.5,
        hq: "true",
        audio: "true"
    },
    {
        annId: 21557,
        annSongId: 2,
        animeNameEn: "Demon Slayer: Kimetsu no Yaiba",
        animeNameJa: "Kimetsu no Yaiba",
        songName: "Gurenge",
        songArtist: "LiSA",
        songTypeName: "OP1",
        songComposer: "Kayoko Kusano",
        songArranger: "Ryo Eguchi",
        difficulty: 72.0,
        hq: "true",
        audio: "true"
    },
    {
        annId: 1,
        annSongId: 3,
        animeNameEn: "Neon Genesis Evangelion",
        animeNameJa: "Shin Seiki Evangelion",
        songName: "A Cruel Angel's Thesis",
        songArtist: "Yoko Takahashi",
        songTypeName: "OP",
        songComposer: "Hidetoshi Sato",
        songArranger: "Toshiyuki Ohmori",
        difficulty: 98.2,
        hq: "true",
        audio: "true"
    }
];

export async function searchSongs(query: string, category: string = 'all'): Promise<SongResult[]> {
    if (!query) return [];

    console.log(`Searching for "${query}" in category "${category}" (Using Mock Data)`);

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 300));

    const lowercaseQuery = query.toLowerCase();

    return MOCK_RESULTS.filter(song => {
        const matchesQuery =
            song.songName.toLowerCase().includes(lowercaseQuery) ||
            song.animeNameEn.toLowerCase().includes(lowercaseQuery) ||
            song.animeNameJa.toLowerCase().includes(lowercaseQuery) ||
            song.songArtist.toLowerCase().includes(lowercaseQuery);

        if (!matchesQuery) return false;

        if (category === 'all') return true;
        if (category === 'song') return song.songName.toLowerCase().includes(lowercaseQuery);
        if (category === 'anime') return song.animeNameEn.toLowerCase().includes(lowercaseQuery) || song.animeNameJa.toLowerCase().includes(lowercaseQuery);
        if (category === 'artist') return song.songArtist.toLowerCase().includes(lowercaseQuery);

        return true;
    });
}
