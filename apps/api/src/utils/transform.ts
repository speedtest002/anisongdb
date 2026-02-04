import type { SongFullMat } from '../db/schema.js';

/**
 * Transforms a SongFullMat record by splitting pipe-separated strings into arrays.
 */
export function transformSongFullMat(
    song: SongFullMat & { sortKey?: number; rank?: number },
) {
    const { sortKey, rank, ...rest } = song;
    return {
        ...rest,
        animeGenres: song.animeGenres?.split('|') ?? [],
        animeTags: song.animeTags?.split('|') ?? [],
        animeAltNames: song.animeAltNames?.split('|') ?? [],
    };
}
