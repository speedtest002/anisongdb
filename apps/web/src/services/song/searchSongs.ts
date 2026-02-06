import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { SongResult } from '../../types/song.js';

export async function searchSongs(
    query: string,
    category: string = 'all',
    type: string = 'all'
): Promise<SongResult[]> {
    if (!query) return [];

    try {
        let results: SongResult[] = [];

        if (category === 'all') {
            const [songResults, animeResults, artistResults] = await Promise.all([
                fetcher<SongResult[]>(`${ENDPOINTS.SONG.SEARCH}?name=${encodeURIComponent(query)}`),
                fetcher<SongResult[]>(`${ENDPOINTS.ANIME.SEARCH}?name=${encodeURIComponent(query)}`),
                fetcher<SongResult[]>(`${ENDPOINTS.ARTIST.SEARCH}?name=${encodeURIComponent(query)}`),
            ]);

            results = [
                ...(Array.isArray(songResults) ? songResults : []),
                ...(Array.isArray(animeResults) ? animeResults : []),
                ...(Array.isArray(artistResults) ? artistResults : []),
            ];

            // Deduplicate by annSongId
            const seen = new Set<number>();
            results = results.filter(song => {
                if (seen.has(song.annSongId)) return false;
                seen.add(song.annSongId);
                return true;
            });
        } else {
            let endpoint = `${ENDPOINTS.SONG.SEARCH}?name=${encodeURIComponent(query)}`;

            if (category === 'anime') {
                endpoint = `${ENDPOINTS.ANIME.SEARCH}?name=${encodeURIComponent(query)}`;
            } else if (category === 'artist') {
                endpoint = `${ENDPOINTS.ARTIST.SEARCH}?name=${encodeURIComponent(query)}`;
            }

            const data = await fetcher<SongResult[]>(endpoint);
            results = Array.isArray(data) ? data : [];
        }

        // Apply song type filtering (OP, ED, INS)
        if (type !== 'all') {
            const typeLower = type.toLowerCase();
            results = results.filter(s => {
                const name = s.songTypeName?.toLowerCase() || '';
                if (typeLower === 'op') return name.includes('opening');
                if (typeLower === 'ed') return name.includes('ending');
                if (typeLower === 'ins') return name.includes('insert');
                return true;
            });
        }

        return results;
    } catch (error) {
        console.error('Service Error: searchSongs failed', error);
        return [];
    }
}
