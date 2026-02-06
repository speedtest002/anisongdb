import { Hono } from 'hono';
import type { AppEnv } from '../types.js';

interface Playlist {
    id: string;
    name: string;
    description?: string;
    userId: string;
    songIds: number[];
    createdAt: string;
    updatedAt: string;
}

// In-memory mock storage for development
let MOCK_PLAYLISTS: Playlist[] = [
    { id: '1', name: 'My Favorites', description: 'Best songs ever', userId: 'user_1', songIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Chill Vibes', description: 'Relaxing anisongs', userId: 'user_1', songIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const playlistRoutes = new Hono<AppEnv>();

// List all playlists
playlistRoutes.get('/', async (c) => {
    return c.json(MOCK_PLAYLISTS);
});

// Get playlist by ID
playlistRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');
    const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
    if (!playlist) return c.json({ error: 'Playlist not found' }, 404);
    return c.json(playlist);
});

// Create playlist
playlistRoutes.post('/', async (c) => {
    const { name, description } = await c.req.json();
    const newPlaylist: Playlist = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: description || '',
        userId: 'user_1',
        songIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    MOCK_PLAYLISTS.push(newPlaylist);
    return c.json(newPlaylist, 201);
});

// Add song to playlist
playlistRoutes.post('/:id/song', async (c) => {
    const id = c.req.param('id');
    const { songId } = await c.req.json();
    const playlist = MOCK_PLAYLISTS.find(p => p.id === id);

    if (!playlist) return c.json({ error: 'Playlist not found' }, 404);

    if (!playlist.songIds.includes(songId)) {
        playlist.songIds.push(songId);
        playlist.updatedAt = new Date().toISOString();
    }

    return c.json({ success: true });
});

// Bulk add songs
playlistRoutes.post('/:id/songs/bulk', async (c) => {
    const id = c.req.param('id');
    const { songIds } = await c.req.json();
    const playlist = MOCK_PLAYLISTS.find(p => p.id === id);

    if (!playlist) return c.json({ error: 'Playlist not found' }, 404);

    let addedCount = 0;
    songIds.forEach((sid: number) => {
        if (!playlist.songIds.includes(sid)) {
            playlist.songIds.push(sid);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        playlist.updatedAt = new Date().toISOString();
    }

    return c.json({ success: true, addedCount });
});

export { playlistRoutes };
