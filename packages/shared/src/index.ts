/**
 * @anisongdb/shared
 * Shared types between API and Web apps
 */

// Example: Database model types (you can expand these based on your D1 schema)
export interface Anime {
    id: number;
    title: string;
    title_jp?: string;
    year?: number;
}

export interface Song {
    id: number;
    anime_id: number;
    title: string;
    artist?: string;
    type?: 'OP' | 'ED' | 'IN';
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
