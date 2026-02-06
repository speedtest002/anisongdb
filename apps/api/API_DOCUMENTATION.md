# AnisongDB API Documentation

This document outlines the backend API endpoints required by the web frontend.

## Base URL
The frontend expects the API to be available at the URL defined in `PUBLIC_API_URL` (e.g., `http://localhost:8787/api`).

---

## 🎵 Songs

### Search Songs
Searches for songs based on a query string.

- **URL:** `/song/search`
- **Method:** `GET`
- **Query Parameters:**
  - `name` (string, required): The search query.
- **Response:** `Array<SongResult>`

### Get Song by ID
Retrieves full details for a specific song.

- **URL:** `/song/{id}`
- **Method:** `GET`
- **Response:** `SongDetail`

---

## 📺 Anime

### Search Anime
Searches for anime and returns songs associated with them.

- **URL:** `/anime/search`
- **Method:** `GET`
- **Query Parameters:**
  - `name` (string, required): The anime name query.
- **Response:** `Array<SongResult>`

---

## 🎤 Artists

### Search Artists
Searches for artists and returns songs associated with them.

- **URL:** `/artist/search`
- **Method:** `GET`
- **Query Parameters:**
  - `name` (string, required): The artist name query.
- **Response:** `Array<SongResult>`

---

## 📂 Playlists

### List Playlists
Retrieves all playlists for the currently authenticated user.

- **URL:** `/playlist`
- **Method:** `GET`
- **Response:** `Array<Playlist>`

### Get Playlist details
Retrieves a specific playlist's details, including its metadata and song list.

- **URL:** `/playlist/{id}`
- **Method:** `GET`
- **Response:** `Playlist`

### Create Playlist
Creates a new playlist for the user.

- **URL:** `/playlist`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- **Response:** `Playlist`

### Add Song to Playlist
Adds a specific song to an existing playlist.

- **URL:** `/playlist/{playlistId}/song`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "songId": number
  }
  ```
- **Response:** `{ success: boolean }` (or the updated Playlist object)

### Bulk Add Songs to Playlist
Adds multiple songs to a specific playlist in a single request.

- **URL:** `/playlist/{playlistId}/songs/bulk`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "songIds": [number]
  }
  ```
- **Response:** `{ success: boolean, addedCount: number }`

---

## 🎵 Media Handling Strategy

The frontend plays music using a standard `<audio>` tag. To ensure reliable playback across all browsers and to handle third-party source limitations (like CORS), the following backend strategy is recommended:

### 1. Proxy Streaming Endpoint (Recommended)
Instead of serving direct links to external CDNs (which might block requests), implement a proxy endpoint.

- **URL:** `/song/{id}/stream`
- **Method:** `GET`
- **Logic:** 
  1. Resolve the internal media URL (e.g., Catbox, Openings.moe).
  2. Fetch the audio/video stream from the source server-side.
  3. Stream the bytes back to the client with appropriate `Content-Type` headers.
- **Benefits:** Bypasses CORS, hides external URLs, and allows for server-side caching.

### 2. Direct Linking (Simplest)
If the external sources allow direct embedding and have stable URLs:
- Populate the `audio` and `hq` fields in the `SongResult` object with direct URLs (e.g., `https://files.catbox.moe/xxxxxx.mp3`).

---

## 🛠 Data Models

### SongResult / SongDetail
```typescript
interface SongResult {
    annId: number;
    annSongId: number;
    animeNameEn: string;
    animeNameJa: string;
    songName: string;
    songArtist: string;
    songTypeName: string; // e.g., "OP1", "ED2"
    songComposer: string;
    songArranger: string;
    difficulty: number;
    hq: string;    // URL to HQ audio/video
    audio: string; // URL to audio file
}
```

### Playlist
```typescript
interface Playlist {
    id: string;
    name: string;
    description?: string;
    userId: string;
    songs: SongResult[]; // Included in GET /playlist/{id}
    createdAt: string;
    updatedAt: string;
}
```
