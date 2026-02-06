import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { SongResult } from '../../types/song.js';

export async function getSongById(id: number): Promise<SongResult | null> {
    try {
        return await fetcher<SongResult>(ENDPOINTS.SONG.GET_BY_ID(id));
    } catch (error) {
        console.error(`Service Error: getSongById(${id}) failed`, error);
        return null;
    }
}
