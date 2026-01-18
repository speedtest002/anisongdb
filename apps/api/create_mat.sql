-- Bước 1: Tạo CTE để pre-aggregate data
DROP TABLE IF EXISTS song_full_mat;

CREATE TABLE song_full_mat AS
WITH 
anime_alt AS (
    SELECT ann_id, GROUP_CONCAT(name, '|') AS alt_names
    FROM anime_names
    WHERE is_main = 0
    GROUP BY ann_id
),
anime_genres_cte AS (
    SELECT ann_id, GROUP_CONCAT(genre_name, '|') AS genres
    FROM anime_genre
    GROUP BY ann_id
),
anime_tags_cte AS (
    SELECT ann_id, GROUP_CONCAT(tag_name, '|') AS tags
    FROM anime_tag
    GROUP BY ann_id
)
SELECT
    sl.ann_song_id,
    sl.song_id,
    sl.ann_id,
    al.mal_id, al.anilist_id, al.kitsu_id,
    -- Anime Time
    a.year AS anime_year,
    a.season_id AS anime_season_id,
    CASE a.season_id
        WHEN 0 THEN 'Winter' WHEN 1 THEN 'Spring'
        WHEN 2 THEN 'Summer' WHEN 3 THEN 'Fall'
    END AS anime_season_text,
    -- Names
    an_ja.name AS anime_name_ja,
    an_en.name AS anime_name_en,
    aa.alt_names AS anime_alt_names,
    a.category AS anime_type,
    (a.category || ' ' || COALESCE(a.category_number, '')) AS anime_category,
    
    -- Anime Metadata
    ag.genres AS anime_genres,
    at.tags AS anime_tags,
    -- Song Display
    s.name AS song_name,
    CASE
        WHEN sl.type = 1 THEN 'Opening ' || sl.number
        WHEN sl.type = 2 THEN 'Ending ' || sl.number
        WHEN sl.type = 3 THEN 'Insert'
    END AS song_type_name,
    COALESCE(ar.name, g.name) AS song_artist,
    COALESCE(ar_comp.name, g_comp.name) AS song_composer,
    COALESCE(ar_arr.name, g_arr.name) AS song_arranger,
    -- Raw Data
    sl.type AS song_type_id,
    sl.number AS song_type_number,
    -- Artist/Group IDs (7 cột để filter theo role)
    s.category as song_category,
    s.song_artist_id,
    s.song_group_id,
    s.composer_artist_id,
    s.composer_group_id,
    s.arranger_artist_id,
    s.arranger_group_id,
    -- Files & Attributes
    su.length AS song_length,
    sl.uploaded AS is_uploaded,
    sl.dub AS is_dub,
    sl.rebroadcast AS is_rebroadcast,
    su.hq, su.mq, su.audio, su.difficulty
FROM song_links AS sl
JOIN anime AS a ON a.ann_id = sl.ann_id
JOIN anime_list AS al ON al.ann_id = sl.ann_id
JOIN song AS s ON s.song_id = sl.song_id
JOIN song_urls AS su ON su.ann_song_id = sl.ann_song_id
-- Join Artist/Group
LEFT JOIN groups AS g ON s.song_group_id = g.group_id
LEFT JOIN artist AS ar ON s.song_artist_id = ar.artist_id
LEFT JOIN artist AS ar_comp ON s.composer_artist_id = ar_comp.artist_id
LEFT JOIN groups AS g_comp ON s.composer_group_id = g_comp.group_id
LEFT JOIN artist AS ar_arr ON s.arranger_artist_id = ar_arr.artist_id
LEFT JOIN groups AS g_arr ON s.arranger_group_id = g_arr.group_id
-- Join Anime Names
LEFT JOIN anime_names AS an_ja ON an_ja.ann_id = sl.ann_id AND an_ja.is_main = 1 AND an_ja.language = 'JA'
LEFT JOIN anime_names AS an_en ON an_en.ann_id = sl.ann_id AND an_en.is_main = 1 AND an_en.language = 'EN'
-- Join pre-aggregated CTEs
LEFT JOIN anime_alt AS aa ON aa.ann_id = sl.ann_id
LEFT JOIN anime_genres_cte AS ag ON ag.ann_id = sl.ann_id
LEFT JOIN anime_tags_cte AS at ON at.ann_id = sl.ann_id;


-- Bước 2: Index quan trọng
CREATE INDEX idx_song_full_mat_ann_song_id ON song_full_mat(ann_song_id);
CREATE INDEX idx_song_full_mat_song_artist ON song_full_mat(song_artist_id);
CREATE INDEX idx_song_full_mat_song_group ON song_full_mat(song_group_id);