-- ================================================================
-- 1. FTS5 for ANIME Search
-- LOGIC: Dữ liệu có thể trùng ann_id (nhiều tên)
-- CẤU TRÚC: rowid (tự sinh bởi FTS5) | name | ann_id (để tham chiếu)
-- LƯU Ý: anime_names KHÔNG có PRIMARY KEY đơn, nên KHÔNG thể map rowid
-- ================================================================
DROP TRIGGER IF EXISTS anime_fts_insert;
DROP TRIGGER IF EXISTS anime_fts_update;
DROP TRIGGER IF EXISTS anime_fts_delete;
DROP TABLE IF EXISTS anime_search;

CREATE VIRTUAL TABLE anime_search USING fts5(
    name,               
    ann_id UNINDEXED,   -- Cần cột này để biết kết quả thuộc về anime nào
    tokenize='trigram'
);

-- FTS5 tự sinh rowid, chỉ cần insert name và ann_id
INSERT INTO anime_search(name, ann_id)
SELECT name, ann_id FROM anime_names;

CREATE TRIGGER anime_fts_insert AFTER INSERT ON anime_names BEGIN
  INSERT INTO anime_search(name, ann_id) VALUES (new.name, new.ann_id);
END;

-- Xóa dựa trên name + ann_id (vì không có rowid mapping)
CREATE TRIGGER anime_fts_delete AFTER DELETE ON anime_names BEGIN
  DELETE FROM anime_search WHERE name = old.name AND ann_id = old.ann_id;
END;

-- Update = Delete + Insert
CREATE TRIGGER anime_fts_update AFTER UPDATE ON anime_names BEGIN
  DELETE FROM anime_search WHERE name = old.name AND ann_id = old.ann_id;
  INSERT INTO anime_search(name, ann_id) VALUES (new.name, new.ann_id);
END;

-- ================================================================
-- 2. FTS5 for SONG Search
-- LOGIC: ID là duy nhất (Primary Key)
-- CẤU TRÚC: rowid (chính là song_id) | name
-- ================================================================
DROP TRIGGER IF EXISTS song_fts_insert;
DROP TRIGGER IF EXISTS song_fts_update;
DROP TRIGGER IF EXISTS song_fts_delete;
DROP TABLE IF EXISTS song_search;

CREATE VIRTUAL TABLE song_search USING fts5(
    name,                
    -- Không cần cột song_id vì rowid chính là song_id rồi
    tokenize='trigram'   
);

-- Mapping: song_id -> rowid FTS
INSERT INTO song_search(rowid, name)
SELECT song_id, name FROM song;

CREATE TRIGGER song_fts_insert AFTER INSERT ON song BEGIN
  INSERT INTO song_search(rowid, name) VALUES (new.song_id, new.name);
END;

CREATE TRIGGER song_fts_delete AFTER DELETE ON song BEGIN
  DELETE FROM song_search WHERE rowid = old.song_id;
END;

CREATE TRIGGER song_fts_update AFTER UPDATE ON song BEGIN
  DELETE FROM song_search WHERE rowid = old.song_id;
  INSERT INTO song_search(rowid, name) VALUES (new.song_id, new.name);
END;

-- ================================================================
-- 3. FTS5 for ARTIST Search
-- LOGIC: ID là duy nhất (Primary Key)
-- CẤU TRÚC: rowid (chính là artist_id) | name
-- ================================================================
DROP TRIGGER IF EXISTS artist_fts_insert;
DROP TRIGGER IF EXISTS artist_fts_update;
DROP TRIGGER IF EXISTS artist_fts_delete;
DROP TABLE IF EXISTS artist_search;

CREATE VIRTUAL TABLE artist_search USING fts5(
    name,
    tokenize='trigram'
);

-- Mapping: artist_id -> rowid FTS
INSERT INTO artist_search(rowid, name)
SELECT artist_id, name FROM artist;

CREATE TRIGGER artist_fts_insert AFTER INSERT ON artist BEGIN
    INSERT INTO artist_search(rowid, name) VALUES (NEW.artist_id, NEW.name);
END;

CREATE TRIGGER artist_fts_delete AFTER DELETE ON artist BEGIN
    DELETE FROM artist_search WHERE rowid = OLD.artist_id;
END;

CREATE TRIGGER artist_fts_update AFTER UPDATE ON artist BEGIN
    DELETE FROM artist_search WHERE rowid = OLD.artist_id;
    INSERT INTO artist_search(rowid, name) VALUES (NEW.artist_id, NEW.name);
END;

-- ================================================================
-- 4. FTS5 for GROUP Search
-- LOGIC: ID là duy nhất (Primary Key)
-- CẤU TRÚC: rowid (chính là group_id) | name
-- ================================================================
DROP TRIGGER IF EXISTS group_fts_insert;
DROP TRIGGER IF EXISTS group_fts_update;
DROP TRIGGER IF EXISTS group_fts_delete;
DROP TABLE IF EXISTS group_search;

CREATE VIRTUAL TABLE group_search USING fts5(
    name,
    tokenize='trigram'
);

-- Mapping: group_id -> rowid FTS
INSERT INTO group_search(rowid, name)
SELECT group_id, name FROM groups;

CREATE TRIGGER group_fts_insert AFTER INSERT ON groups BEGIN
    INSERT INTO group_search(rowid, name) VALUES (NEW.group_id, NEW.name);
END;

CREATE TRIGGER group_fts_delete AFTER DELETE ON groups BEGIN
    DELETE FROM group_search WHERE rowid = OLD.group_id;
END;

CREATE TRIGGER group_fts_update AFTER UPDATE ON groups BEGIN
    DELETE FROM group_search WHERE rowid = OLD.group_id;
    INSERT INTO group_search(rowid, name) VALUES (NEW.group_id, NEW.name);
END;
