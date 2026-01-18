/**
 * @anisongdb/shared
 * Shared types between API and Web apps
 */

import type { D1Meta } from '@cloudflare/workers-types';

// Example: Database model types (you can expand these based on your D1 schema)
export interface Anime {
    annId: number;
    category: string;
    categoryNumber: number | null;
    year: number;
    seasonId: number;
}

export interface Song {
    id: number;
    animeId: number;
    title: string;
    artist?: string;
    type?: 'OP' | 'ED' | 'IN';
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: D1Meta & Record<string, unknown>;
    message?: string;
}

export * from './song';
export * from './search';
