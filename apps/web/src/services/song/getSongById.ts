import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { SongResult } from '../../types/song.js';
import { HIGURASHI_MOCK_DATA } from './higurashiMock.js';

export async function getSongById(id: number): Promise<SongResult | null> {
    try {
        return await fetcher<SongResult>(ENDPOINTS.SONG.GET_BY_ID(id));
    } catch (error) {
        console.warn(`Service: getSongById(${id}) failed, checking mock data`, error);
        return HIGURASHI_MOCK_DATA.find(s => s.annSongId === id) || null;
    }
}
