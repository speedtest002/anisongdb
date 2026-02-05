import { atom, map } from 'nanostores';
import { persistentAtom, persistentMap } from '@nanostores/persistent';
import type { PlayerState, RepeatMode } from '../types/player.js';
import type { SongResult } from '../types/song.js';

export const $playerState = map<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1, // Will be overridden by sync persistent atom
    isMuted: false,
    progress: 0,
    duration: 0,
    queue: [],
    history: [],
    shuffle: false,
    repeat: 'none',
});

// Persistent pieces
export const $volume = persistentAtom<number>('player:volume', 0.8, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const $repeatMode = persistentAtom<RepeatMode>('player:repeat', 'none');
export const $isShuffle = persistentAtom<boolean>('player:shuffle', false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

// Sync persistent state to main state map on mount/init
$volume.subscribe(v => $playerState.setKey('volume', v));
$repeatMode.subscribe(r => $playerState.setKey('repeat', r));
$isShuffle.subscribe(s => $playerState.setKey('shuffle', s));

// Actions
export const playSong = (song: SongResult) => {
    $playerState.setKey('currentSong', song);
    $playerState.setKey('isPlaying', true);
    $playerState.setKey('progress', 0);
};

export const togglePlay = () => {
    const currentState = $playerState.get();
    if (currentState.currentSong) {
        $playerState.setKey('isPlaying', !currentState.isPlaying);
    }
};

export const setProgress = (progress: number) => {
    $playerState.setKey('progress', progress);
};

export const setDuration = (duration: number) => {
    $playerState.setKey('duration', duration);
};

export const setVolume = (volume: number) => {
    $volume.set(volume);
};

export const toggleMute = () => {
    const isMuted = $playerState.get().isMuted;
    $playerState.setKey('isMuted', !isMuted);
};

export const setQueue = (songs: SongResult[]) => {
    $playerState.setKey('queue', songs);
};

export const addToQueue = (song: SongResult) => {
    const currentQueue = $playerState.get().queue;
    $playerState.setKey('queue', [...currentQueue, song]);
};

export const skipNext = () => {
    const state = $playerState.get();
    if (state.queue.length > 0) {
        const nextSong = state.queue[0];
        const newQueue = state.queue.slice(1);
        $playerState.setKey('history', [...state.history, state.currentSong!]);
        $playerState.setKey('currentSong', nextSong);
        $playerState.setKey('queue', newQueue);
        $playerState.setKey('isPlaying', true);
        $playerState.setKey('progress', 0);
    }
};

export const skipPrevious = () => {
    const state = $playerState.get();
    if (state.history.length > 0) {
        const prevSong = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        if (state.currentSong) {
            $playerState.setKey('queue', [state.currentSong, ...state.queue]);
        }
        $playerState.setKey('currentSong', prevSong);
        $playerState.setKey('history', newHistory);
        $playerState.setKey('isPlaying', true);
        $playerState.setKey('progress', 0);
    }
};

export const toggleShuffle = () => {
    $isShuffle.set(!$isShuffle.get());
};

export const cycleRepeat = () => {
    const current = $repeatMode.get();
    if (current === 'none') $repeatMode.set('all');
    else if (current === 'all') $repeatMode.set('one');
    else $repeatMode.set('none');
};
