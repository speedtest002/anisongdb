import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { Playlist } from '../../types/playlist.js';

// Temporary mock state for testing when backend is down
let MOCK_PLAYLISTS: Playlist[] = [
    { id: '1', name: 'My Favorites', description: 'Best songs ever', userId: 'user_1', songIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Chill Vibes', description: 'Relaxing anisongs', userId: 'user_1', songIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class PlaylistService {
    /**
     * Fetches all playlists for the current user.
     */
    static async getPlaylists(): Promise<Playlist[]> {
        try {
            const data = await fetcher<Playlist[]>(ENDPOINTS.PLAYLIST.LIST);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.warn('Service: getPlaylists failed, using mock data', error);
            return MOCK_PLAYLISTS;
        }
    }

    /**
     * Fetches a specific playlist by its ID.
     */
    static async getPlaylistById(id: string): Promise<Playlist | null> {
        try {
            return await fetcher<Playlist>(ENDPOINTS.PLAYLIST.GET(id));
        } catch (error) {
            console.warn(`Service: getPlaylistById(${id}) failed, using mock data`, error);
            return MOCK_PLAYLISTS.find(p => p.id === id) || null;
        }
    }

    /**
     * Creates a new playlist.
     */
    static async createPlaylist(name: string, description?: string): Promise<Playlist | null> {
        try {
            return await fetcher<Playlist>(ENDPOINTS.PLAYLIST.CREATE, {
                method: 'POST',
                body: JSON.stringify({ name, description }),
            });
        } catch (error) {
            console.warn('Service: createPlaylist failed, simulating locally for testing', error);
            const mockNew: Playlist = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                description: description || '',
                userId: 'user_1',
                songIds: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_PLAYLISTS.push(mockNew);
            return mockNew;
        }
    }

    /**
     * Adds a song to a specific playlist.
     */
    static async addSongToPlaylist(playlistId: string, songId: number): Promise<boolean> {
        try {
            await fetcher(ENDPOINTS.PLAYLIST.ADD_SONG(playlistId), {
                method: 'POST',
                body: JSON.stringify({ songId }),
            });
            return true;
        } catch (error) {
            console.warn(`Service: addSongToPlaylist failed, simulating locally`, error);
            const playlist = MOCK_PLAYLISTS.find(p => p.id === playlistId);
            if (playlist && !playlist.songIds.includes(songId)) {
                playlist.songIds.push(songId);
            }
            return true;
        }
    }

    /**
     * Adds multiple songs to a specific playlist.
     */
    static async addSongsToPlaylist(playlistId: string, songIds: number[]): Promise<boolean> {
        try {
            await fetcher(ENDPOINTS.PLAYLIST.BULK_ADD_SONGS(playlistId), {
                method: 'POST',
                body: JSON.stringify({ songIds }),
            });
            return true;
        } catch (error) {
            console.warn(`Service: addSongsToPlaylist failed, simulating locally`, error);
            const playlist = MOCK_PLAYLISTS.find(p => p.id === playlistId);
            if (playlist) {
                songIds.forEach(id => {
                    if (!playlist.songIds.includes(id)) {
                        playlist.songIds.push(id);
                    }
                });
            }
            return true;
        }
    }
}
