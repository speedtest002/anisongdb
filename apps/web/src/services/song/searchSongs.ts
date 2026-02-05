import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { SongResult } from '../../types/song.js';

export async function searchSongs(query: string, category: string = 'all'): Promise<SongResult[]> {
    if (!query) return [];

    let endpoint = `${ENDPOINTS.SONG.SEARCH}?name=${encodeURIComponent(query)}`;

    if (category === 'anime') {
        endpoint = `${ENDPOINTS.ANIME.SEARCH}?name=${encodeURIComponent(query)}`;
    } else if (category === 'artist') {
        endpoint = `${ENDPOINTS.ARTIST.SEARCH}?name=${encodeURIComponent(query)}`;
    }

    try {
        const data = await fetcher<SongResult[]>(endpoint);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Service Error: searchSongs failed', error);
        return [];
    }
}
