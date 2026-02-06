import { fetcher } from '../../lib/fetcher.js';
import { ENDPOINTS } from '../../lib/constants.js';
import type { Playlist } from '../../types/playlist.js';

export class PlaylistService {
    /**
     * Fetches all playlists for the current user.
     */
    static async getPlaylists(): Promise<Playlist[]> {
        try {
            const data = await fetcher<Playlist[]>(ENDPOINTS.PLAYLIST.LIST);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Service Error: getPlaylists failed', error);
            return [];
        }
    }

    /**
     * Fetches a specific playlist by its ID.
     */
    static async getPlaylistById(id: string): Promise<Playlist | null> {
        try {
            return await fetcher<Playlist>(ENDPOINTS.PLAYLIST.GET(id));
        } catch (error) {
            console.error(`Service Error: getPlaylistById(${id}) failed`, error);
            return null;
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
            console.error('Service Error: createPlaylist failed', error);
            return null;
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
            console.error(`Service Error: addSongToPlaylist failed`, error);
            return false;
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
            console.error(`Service Error: addSongsToPlaylist failed`, error);
            return false;
        }
    }
}
