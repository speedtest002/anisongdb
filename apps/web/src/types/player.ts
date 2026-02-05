import type { SongResult } from './song.js';

export type RepeatMode = 'none' | 'all' | 'one';

export interface PlayerState {
    currentSong: SongResult | null;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    progress: number; // In seconds
    duration: number; // In seconds
    queue: SongResult[];
    history: SongResult[];
    shuffle: boolean;
    repeat: RepeatMode;
}
