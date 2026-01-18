import { eq, and, inArray, type SQL } from 'drizzle-orm';
import { songFullMat } from '../db/schema.js';
import type { SearchRequest } from '@anisongdb/shared';

/**
 * Build SQL conditions from SearchRequest filters
 */
export function buildFilterConditions(body: SearchRequest): SQL[] {
    const conditions: SQL[] = [];
    
    // Dub filter: if dub=false, exclude dubs
    if (!body.dub) {
        conditions.push(eq(songFullMat.isDub, 0));
    }

    // Broadcast filter (XOR logic)
    const { normalBroadcast, rebroadcast } = body;
    if (normalBroadcast !== rebroadcast) {
        conditions.push(eq(songFullMat.isRebroadcast, rebroadcast ? 1 : 0));
    }

    // Song type filter (Opening=1, Ending=2, Insert=3)
    const songTypes: number[] = [];
    if (body.openingFilter) songTypes.push(1);
    if (body.endingFilter) songTypes.push(2);
    if (body.insertFilter) songTypes.push(3);
    if (songTypes.length > 0 && songTypes.length < 3) {
        conditions.push(inArray(songFullMat.songTypeId, songTypes));
    }

    // Category filter (1=Instrumental, 2=Chanting, 3=Character, 4=Standard)
    const categories: number[] = [];
    if (body.instrumental) categories.push(1);
    if (body.chanting) categories.push(2);
    if (body.character) categories.push(3);
    if (body.standard) categories.push(4);
    if (categories.length > 0 && categories.length < 4) {
        conditions.push(inArray(songFullMat.songCategory, categories));
    }

    return conditions;
}

/**
 * Combine base condition with filter conditions using AND
 */
export function combineConditions(baseCondition: SQL, filters: SQL[]): SQL {
    if (filters.length === 0) {
        return baseCondition;
    }
    return and(baseCondition, ...filters)!;
}
