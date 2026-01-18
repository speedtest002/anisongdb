Dưới đây là bản tổng kết thiết kế cuối cùng cho bảng **Materialized View** (tôi sẽ gọi là `song_search_index`) dựa trên các yêu cầu: **tối ưu đọc (read)**, **tìm kiếm nhanh**, và **hỗ trợ FTS5** cho thành viên nhóm.

### 1. Cấu trúc bảng (Schema - Kysely TypeScript)

Chúng ta sẽ giữ lại ID gốc cho các bộ lọc (Filter) và Text đã xử lý sẵn cho việc hiển thị (Display).

```typescript
// packages/shared/src/db-schema.ts

export interface SongSearchIndexTable {
    // --- KHÓA CHÍNH (Dùng làm ROWID cho FTS) ---
    ann_song_id: number;

    // --- LIÊN KẾT NGOÀI ---
    song_id: number;
    ann_id: number;
    mal_id: number | null;
    anilist_id: number | null;
    kitsu_id: number | null;

    // --- ANIME INFO (FILTER & SORT) ---
    anime_year: number;
    anime_season_id: 0 | 1 | 2 | 3; // 0=Winter, 1=Spring...

    // --- ANIME INFO (DISPLAY) ---
    anime_season_text: 'Winter' | 'Spring' | 'Summer' | 'Fall';
    anime_name_ja: string | null;
    anime_name_en: string | null;
    anime_alt_names: string | null; // Chuỗi hiển thị phụ
    anime_type: string; // TV, Movie...
    anime_category: string; // TV 1, Movie 2023...

    // --- SONG INFO (DISPLAY) ---
    song_name: string | null;
    song_type_name: string; // Opening 1, Ending 2...
    song_artist: string | null; // Tên ca sĩ hiển thị
    song_composer: string | null;
    song_arranger: string | null;

    // --- SONG INFO (RAW DATA) ---
    song_type_id: 1 | 2 | 3;
    song_type_number: number;

    // --- SEARCH DATA (DÀNH CHO FTS5) ---
    // Cột này chứa chuỗi ID của: Artist + Group + Group Members + Composer...
    // Ví dụ: "101 102 19830 555"
    search_ids_str: string | null;

    // --- ATTRIBUTES & FILES ---
    song_length: number | null;
    is_dub: 0 | 1;
    is_rebroadcast: 0 | 1;
    hq: string | null;
    mq: string | null;
    audio: string | null;
}
```

---

### 2. Thiết lập Database (SQLite)

Bạn cần chạy các lệnh SQL này 1 lần để tạo cấu trúc tối ưu.

#### Bước A: Tạo bảng chính

```sql
CREATE TABLE song_search_index (
    ann_song_id INTEGER PRIMARY KEY, -- Quan trọng: Integer PK là RowID
    song_id INTEGER,
    ann_id INTEGER,
    mal_id INTEGER, anilist_id INTEGER, kitsu_id INTEGER,
    anime_year INTEGER,
    anime_season_id INTEGER,
    anime_season_text TEXT,
    anime_name_ja TEXT, anime_name_en TEXT, anime_alt_names TEXT,
    anime_type TEXT, anime_category TEXT,
    song_name TEXT,
    song_type_name TEXT,
    song_artist TEXT, song_composer TEXT, song_arranger TEXT,
    song_type_id INTEGER, song_type_number INTEGER,
    search_ids_str TEXT, -- Cột quan trọng để search ID thành viên
    song_length INTEGER,
    is_dub INTEGER, is_rebroadcast INTEGER,
    hq TEXT, mq TEXT, audio TEXT
);
```

#### Bước B: Tạo Composite Index (Cho Filter Mùa/Năm)

Tối ưu hóa query `WHERE year = 2024 AND season = 1`.

```sql
CREATE INDEX idx_song_search_year_season
ON song_search_index (anime_year, anime_season_id);
```

#### Bước C: Tạo FTS5 External Content (Cho Search ID thành viên)

Tối ưu hóa Reads, không lưu lặp dữ liệu.

```sql
-- 1. Tạo bảng ảo
CREATE VIRTUAL TABLE song_search_fts USING fts5(
    search_ids_str,             -- Chỉ index cột này
    content='song_search_index', -- Dữ liệu lấy từ bảng chính
    content_rowid='ann_song_id'  -- Link qua cột này
);

-- 2. Tạo Trigger để tự động đồng bộ (Sync)
-- Trigger Insert
CREATE TRIGGER song_search_fts_ai AFTER INSERT ON song_search_index BEGIN
  INSERT INTO song_search_fts(rowid, search_ids_str) VALUES (new.ann_song_id, new.search_ids_str);
END;

-- Trigger Delete
CREATE TRIGGER song_search_fts_ad AFTER DELETE ON song_search_index BEGIN
  INSERT INTO song_search_fts(song_search_fts, rowid, search_ids_str) VALUES('delete', old.ann_song_id, old.search_ids_str);
END;

-- Trigger Update
CREATE TRIGGER song_search_fts_au AFTER UPDATE ON song_search_index BEGIN
  INSERT INTO song_search_fts(song_search_fts, rowid, search_ids_str) VALUES('delete', old.ann_song_id, old.search_ids_str);
  INSERT INTO song_search_fts(rowid, search_ids_str) VALUES (new.ann_song_id, new.search_ids_str);
END;
```

---

### 3. Query đổ dữ liệu (Population Query)

Câu query này dùng để lấy dữ liệu từ các bảng cũ nhét vào bảng mới.
_Lưu ý phần `search_ids_str`: Tôi đã gộp ID của Artist, Group và cả Group Members vào một chuỗi._

```sql
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
    (SELECT GROUP_CONCAT(name, '|') FROM anime_names WHERE ann_id = sl.ann_id AND is_main = 0) AS anime_alt_names,
    a.category AS anime_type,
    (a.category || ' ' || COALESCE(a.category_number, '')) AS anime_category,

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

    -- FTS Search String (Gộp tất cả ID liên quan vào đây)
    (
        COALESCE(s.song_artist_id, '') || ' ' ||
        COALESCE(s.song_group_id, '') || ' ' ||
        -- Subquery lấy ID thành viên trong nhóm (QUAN TRỌNG)
        COALESCE((SELECT GROUP_CONCAT(artist_id, ' ') FROM group_artist WHERE group_id = s.song_group_id), '') || ' ' ||
        COALESCE(s.composer_artist_id, '') || ' ' ||
        COALESCE(s.arranger_artist_id, '')
    ) AS search_ids_str,

    -- Files & Attributes
    su.length AS song_length,
    sl.dub AS is_dub,
    sl.rebroadcast AS is_rebroadcast,
    su.hq, su.mq, su.audio

FROM song_links AS sl
JOIN anime AS a ON a.ann_id = sl.ann_id
JOIN anime_list AS al ON al.ann_id = sl.ann_id
JOIN song AS s ON s.song_id = sl.song_id
JOIN song_urls AS su ON su.ann_song_id = sl.ann_song_id

-- Join Artist/Group để lấy tên hiển thị
LEFT JOIN groups AS g ON s.song_group_id = g.group_id
LEFT JOIN artist AS ar ON s.song_artist_id = ar.artist_id
LEFT JOIN artist AS ar_comp ON s.composer_artist_id = ar_comp.artist_id
LEFT JOIN groups AS g_comp ON s.composer_group_id = g_comp.group_id
LEFT JOIN artist AS ar_arr ON s.arranger_artist_id = ar_arr.artist_id
LEFT JOIN groups AS g_arr ON s.arranger_group_id = g_arr.group_id

-- Join Anime Names
LEFT JOIN anime_names AS an_ja ON an_ja.ann_id = sl.ann_id AND an_ja.is_main = 1 AND an_ja.language = 'JA'
LEFT JOIN anime_names AS an_en ON an_en.ann_id = sl.ann_id AND an_en.is_main = 1 AND an_en.language = 'EN';
```

### 4. Cách sử dụng (Truy vấn)

Đây là cách bạn query cực nhanh với số lần Read tối thiểu:

**Ví dụ:** Tìm bài hát trong "Mùa Xuân 2024" có sự tham gia của Artist ID `19830` (dù là hát chính hay thành viên nhóm).

```typescript
const result = await db
    .selectFrom('song_search_index')
    .selectAll()
    .where('anime_year', '=', 2024) // Dùng B-Tree Index (Nhanh)
    .where('anime_season_id', '=', 1) // Dùng B-Tree Index (Nhanh)
    .where(
        'ann_song_id',
        'in',
        (
            qb, // Dùng FTS Index (Nhanh, ít read)
        ) =>
            qb
                .selectFrom('song_search_fts')
                .select('rowid')
                .where('search_ids_str', 'match', '"19830"'), // Tìm chính xác token 19830
    )
    .execute();
```
