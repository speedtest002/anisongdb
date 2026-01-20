import {
    sqliteTable,
    integer,
    text,
    real,
    index,
    uniqueIndex,
    primaryKey,
} from 'drizzle-orm/sqlite-core';

export const artist = sqliteTable('artist', {
    artistId: integer('artist_id').primaryKey(),
    name: text('name'),
    nameNormalized: text('name_normalized'),
});

export const artistAltName = sqliteTable(
    'artist_alt_name',
    {
        artistId: integer('artist_id').references(() => artist.artistId),
        altId: integer('alt_id').references(() => artist.artistId),
    },
    (table) => [
        uniqueIndex('idx_artist_alt_unique').on(table.artistId, table.altId),
    ],
);

export const anime = sqliteTable('anime', {
    annId: integer('ann_id').primaryKey(),
    category: text('category'),
    categoryNumber: integer('category_number'),
    year: integer('year'),
    seasonId: integer('season_id'),
});

export const animeList = sqliteTable('anime_list', {
    annId: integer('ann_id')
        .primaryKey()
        .references(() => anime.annId),
    malId: integer('mal_id'),
    kitsuId: integer('kitsu_id'),
    anilistId: integer('anilist_id'),
});

export const animeGenre = sqliteTable(
    'anime_genre',
    {
        annId: integer('ann_id').references(() => anime.annId),
        genreName: text('genre_name').notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.annId, table.genreName],
            name: 'anime_genre_ann_id_genre_name_pk',
        }),
    ],
);

export const animeTag = sqliteTable(
    'anime_tag',
    {
        annId: integer('ann_id').references(() => anime.annId),
        tagName: text('tag_name').notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.annId, table.tagName],
            name: 'anime_tag_ann_id_tag_name_pk',
        }),
    ],
);

export const animeNames = sqliteTable(
    'anime_names',
    {
        annId: integer('ann_id').references(() => anime.annId),
        language: text('language'),
        name: text('name'),
        isMain: integer('is_main'),
        nameNormalized: text('name_normalized'),
    },
    (table) => [
        uniqueIndex('idx_anime_names_unique').on(
            table.annId,
            table.language,
            table.name,
        ),
        index('idx_anime_names_ann_id').on(table.annId),
    ],
);

export const groups = sqliteTable('groups', {
    groupId: integer('group_id').primaryKey(),
    name: text('name'),
    nameNormalized: text('name_normalized'),
});

export const groupAltName = sqliteTable(
    'group_alt_name',
    {
        mainGroupId: integer('main_group_id').references(() => groups.groupId),
        altGroupId: integer('alt_group_id').references(() => groups.groupId),
    },
    (table) => [
        primaryKey({
            columns: [table.mainGroupId, table.altGroupId],
            name: 'group_alt_name_main_group_id_alt_group_id_pk',
        }),
    ],
);

export const groupArtist = sqliteTable(
    'group_artist',
    {
        artistId: integer('artist_id').references(() => artist.artistId),
        groupId: integer('group_id').references(() => groups.groupId),
    },
    (table) => [
        uniqueIndex('idx_group_artist_unique').on(
            table.artistId,
            table.groupId,
        ),
        primaryKey({
            columns: [table.artistId, table.groupId],
            name: 'group_artist_artist_id_group_id_pk',
        }),
    ],
);

export const groupGroup = sqliteTable(
    'group_group',
    {
        parentGroupId: integer('parent_group_id').references(
            () => groups.groupId,
        ),
        childGroupId: integer('child_group_id').references(
            () => groups.groupId,
        ),
    },
    (table) => [
        uniqueIndex('idx_group_group_unique').on(
            table.parentGroupId,
            table.childGroupId,
        ),
        primaryKey({
            columns: [table.parentGroupId, table.childGroupId],
            name: 'group_group_parent_group_id_child_group_id_pk',
        }),
    ],
);

export const song = sqliteTable(
    'song',
    {
        songId: integer('song_id').primaryKey(),
        name: text('name'),
        songArtistId: integer('song_artist_id'),
        composerArtistId: integer('composer_artist_id'),
        arrangerArtistId: integer('arranger_artist_id'),
        songGroupId: integer('song_group_id'),
        composerGroupId: integer('composer_group_id'),
        arrangerGroupId: integer('arranger_group_id'),
        category: integer('category'),
        nameNormalized: text('name_normalized'),
    },
    (table) => [
        index('idx_song_artist').on(table.songArtistId),
        index('idx_song_composer').on(table.composerArtistId),
        index('idx_song_arranger').on(table.arrangerArtistId),
        index('idx_song_group').on(table.songGroupId),
        index('idx_song_composer_group').on(table.composerGroupId),
        index('idx_song_arranger_group').on(table.arrangerGroupId),
    ],
);

export const songLinks = sqliteTable(
    'song_links',
    {
        annSongId: integer('ann_song_id').primaryKey(),
        songId: integer('song_id').references(() => song.songId),
        annId: integer('ann_id').references(() => anime.annId),
        number: integer('number'),
        type: integer('type'),
        uploaded: integer('uploaded'),
        rebroadcast: integer('rebroadcast'),
        dub: integer('dub'),
    },
    (table) => [index('idx_song_links_song_id').on(table.songId)],
);

export const songUrls = sqliteTable(
    'song_urls',
    {
        annSongId: integer('ann_song_id')
            .primaryKey()
            .references(() => songLinks.annSongId),
        difficulty: real('difficulty'),
        hq: text('hq'),
        mq: text('mq'),
        audio: text('audio'),
        length: real('length'),
    },
    (table) => [index('idx_song_urls_ann_song_id').on(table.annSongId)],
);

export const songShortNames = sqliteTable(
    'song_short_names',
    {
        songId: integer('song_id').primaryKey(),
        name: text('name'),
        nameNormalized: text('name_normalized'),
    },
    (table) => [
        index('idx_song_short_song_id').on(table.songId),
        index('idx_song_short_name').on(table.name),
        index('idx_song_short_normalized').on(table.nameNormalized),
    ],
);

export const animeShortNames = sqliteTable(
    'anime_short_names',
    {
        annId: integer('ann_id').references(() => anime.annId),
        language: text('language').notNull(),
        name: text('name').notNull(),
        nameNormalized: text('name_normalized').notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.annId, table.language, table.name],
            name: 'anime_short_names_pk',
        }),
        index('idx_anime_short_name').on(table.name),
        index('idx_anime_short_normalized').on(table.nameNormalized),
    ],
);

export const artistShortNames = sqliteTable(
    'artist_short_names',
    {
        artistId: integer('artist_id').primaryKey().references(() => artist.artistId),
        name: text('name').notNull(),
        nameNormalized: text('name_normalized').notNull(),
    },
    (table) => [
        index('idx_artist_short_name').on(table.name),
        index('idx_artist_short_normalized').on(table.nameNormalized),
    ],
);

export const groupShortNames = sqliteTable(
    'group_short_names',
    {
        groupId: integer('group_id').primaryKey().references(() => groups.groupId),
        name: text('name').notNull(),
        nameNormalized: text('name_normalized').notNull(),
    },
    (table) => [
        index('idx_groups_short_name').on(table.name),
        index('idx_groups_short_normalized').on(table.nameNormalized),
    ],
);

export const songFullMat = sqliteTable(
    'song_full_mat',
    {
        annSongId: integer('ann_song_id').primaryKey(),
        songId: integer('song_id').notNull(),
        annId: integer('ann_id').notNull(),
        malId: integer('mal_id'),
        anilistId: integer('anilist_id'),
        kitsuId: integer('kitsu_id'),
        animeYear: integer('anime_year'),
        animeSeasonId: integer('anime_season_id'),
        animeSeasonText: text('anime_season_text'),
        animeNameJa: text('anime_name_ja'),
        animeNameEn: text('anime_name_en'),
        animeAltNames: text('anime_alt_names'),
        animeType: text('anime_type'),
        animeCategory: text('anime_category'),
        animeGenres: text('anime_genres'),
        animeTags: text('anime_tags'),
        songName: text('song_name'),
        songTypeName: text('song_type_name'),
        songArtist: text('song_artist'),
        songComposer: text('song_composer'),
        songArranger: text('song_arranger'),
        songTypeId: integer('song_type_id').notNull(),
        songTypeNumber: integer('song_type_number'),
        songCategory: integer('song_category'),
        songArtistId: integer('song_artist_id'),
        songGroupId: integer('song_group_id'),
        composerArtistId: integer('composer_artist_id'),
        composerGroupId: integer('composer_group_id'),
        arrangerArtistId: integer('arranger_artist_id'),
        arrangerGroupId: integer('arranger_group_id'),
        songLength: real('song_length'),
        isUploaded: integer('is_uploaded').notNull(),
        isDub: integer('is_dub').notNull(),
        isRebroadcast: integer('is_rebroadcast').notNull(),
        hq: text('hq'),
        mq: text('mq'),
        audio: text('audio'),
        difficulty: real('difficulty'),
    },
    (table) => [
        index('idx_song_full_mat_ann_song_id').on(table.annSongId),
        index('idx_song_full_mat_song_id').on(table.songId),
        index('idx_song_full_mat_ann_id').on(table.annId),
        index('idx_song_full_mat_anime_year').on(table.animeYear),
        index('idx_song_full_mat_song_type_id').on(table.songTypeId),
        index('idx_song_full_mat_is_dub').on(table.isDub),
        index('idx_song_full_mat_is_rebroadcast').on(table.isRebroadcast),
    ],
);

export const songSearch = sqliteTable('song_search', {
    rowid: integer('rowid').primaryKey(),
    name: text('name'),
    nameNormalized: text('name_normalized'),
});

export const animeSearch = sqliteTable('anime_search', {
    rowid: integer('rowid').primaryKey(),
    name: text('name'),
    annId: integer('ann_id'),
    nameNormalized: text('name_normalized'),
});

export const artistSearch = sqliteTable('artist_search', {
    rowid: integer('rowid').primaryKey(),
    name: text('name'),
    nameNormalized: text('name_normalized'),
});

export const groupSearch = sqliteTable('group_search', {
    rowid: integer('rowid').primaryKey(),
    name: text('name'),
    nameNormalized: text('name_normalized'),
});

export type Artist = typeof artist.$inferSelect;
export type ArtistAltName = typeof artistAltName.$inferSelect;
export type Anime = typeof anime.$inferSelect;
export type AnimeList = typeof animeList.$inferSelect;
export type AnimeGenre = typeof animeGenre.$inferSelect;
export type AnimeTag = typeof animeTag.$inferSelect;
export type AnimeNames = typeof animeNames.$inferSelect;
export type Groups = typeof groups.$inferSelect;
export type GroupAltName = typeof groupAltName.$inferSelect;
export type GroupArtist = typeof groupArtist.$inferSelect;
export type GroupGroup = typeof groupGroup.$inferSelect;
export type Song = typeof song.$inferSelect;
export type SongLinks = typeof songLinks.$inferSelect;
export type SongUrls = typeof songUrls.$inferSelect;
export type SongFullMat = typeof songFullMat.$inferSelect;
export type SongSearch = typeof songSearch.$inferSelect;
export type AnimeSearch = typeof animeSearch.$inferSelect;
