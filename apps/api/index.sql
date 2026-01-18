-- ================================================================
-- Indexes for song_full_mat (all numeric fields)
-- ================================================================

-- Primary/Foreign Keys
CREATE INDEX IF NOT EXISTS idx_song_full_mat_ann_song_id ON song_full_mat(ann_song_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_id ON song_full_mat(song_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_ann_id ON song_full_mat(ann_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_mal_id ON song_full_mat(mal_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_anilist_id ON song_full_mat(anilist_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_kitsu_id ON song_full_mat(kitsu_id);

-- Anime Info (for filtering & sorting)
CREATE INDEX IF NOT EXISTS idx_song_full_mat_anime_year ON song_full_mat(anime_year);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_anime_season_id ON song_full_mat(anime_season_id);

-- Song Info (for filtering)
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_type_id ON song_full_mat(song_type_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_type_number ON song_full_mat(song_type_number);

-- Artist/Group IDs (for filtering by role)
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_artist_id ON song_full_mat(song_artist_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_group_id ON song_full_mat(song_group_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_composer_artist_id ON song_full_mat(composer_artist_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_composer_group_id ON song_full_mat(composer_group_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_arranger_artist_id ON song_full_mat(arranger_artist_id);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_arranger_group_id ON song_full_mat(arranger_group_id);

-- Files & Attributes (for filtering)
CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_length ON song_full_mat(song_length);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_uploaded ON song_full_mat(is_uploaded);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_dub ON song_full_mat(is_dub);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_rebroadcast ON song_full_mat(is_rebroadcast);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_difficulty ON song_full_mat(difficulty);

CREATE INDEX IF NOT EXISTS idx_song_full_mat_hq ON song_full_mat(hq);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_mq ON song_full_mat(mq);
CREATE INDEX IF NOT EXISTS idx_song_full_mat_audio ON song_full_mat(audio);