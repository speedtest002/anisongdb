"""
Anisong Database Import Script

SCOPE: Import dữ liệu từ 4 file JSON + tạo schema cho tất cả tables
- animeList.json -> anime, anime_names
- songMap.json -> song, song_links  
- artistMap.json -> artist, artist_alt_name
- groupMap.json -> groups, group_alt_name, group_artist, group_group

SCHEMA ĐƯỢC TẠO NHƯNG KHÔNG IMPORT DỮ LIỆU:
- song_urls (URLs + difficulty + length - ALL fields nullable except ann_song_id)
- anime_list (External IDs: MAL, Kitsu, AniList - do user tự import)  
- anime_genre, anime_tag (phân loại anime với TEXT names - do user tự import)

Tạo schema đầy đủ để đảm bảo foreign key constraints và cấu trúc hoàn chỉnh.
"""

import json
import sqlite3
import logging
from typing import Dict, Any, Optional, List, Set, Tuple
from datetime import datetime

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('import.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def load_json(path: str) -> Dict[str, Any]:
    """Load JSON file with error handling"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            logger.info(f"✅ Đã load {len(data)} records từ {path}")
            return data
    except FileNotFoundError:
        logger.error(f"❌ Không tìm thấy file: {path}")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"❌ File JSON không hợp lệ: {path} - {e}")
        return {}
    except Exception as e:
        logger.error(f"❌ Lỗi không xác định khi đọc {path}: {e}")
        return {}

def     init_schema(conn: sqlite3.Connection) -> None:
    """Initialize database schema - JSON tables + manual tables structure"""
    cur = conn.cursor()
    try:
        cur.executescript("""
        -- ===== TABLES FROM JSON FILES (anisongdb.py manages these) =====
        
        CREATE TABLE IF NOT EXISTS anime (
            ann_id INTEGER PRIMARY KEY,
            category TEXT,
            category_number INTEGER,
            year INTEGER,
            season_id INTEGER
        );

        CREATE TABLE IF NOT EXISTS anime_names (
            ann_id INTEGER,
            language TEXT,
            name TEXT,
            is_main BOOLEAN,
            FOREIGN KEY (ann_id) REFERENCES anime(ann_id),
            PRIMARY KEY (ann_id, language, name)
        );

        CREATE TABLE IF NOT EXISTS song (
            song_id INTEGER PRIMARY KEY,
            name TEXT,
            song_artist_id INTEGER,
            composer_artist_id INTEGER,
            arranger_artist_id INTEGER,
            song_group_id INTEGER,
            composer_group_id INTEGER,
            arranger_group_id INTEGER,
            category INTEGER
        );

        -- Song links from JSON data
        CREATE TABLE IF NOT EXISTS song_links (
            ann_song_id INTEGER PRIMARY KEY,
            song_id INTEGER REFERENCES song(song_id),
            ann_id INTEGER REFERENCES anime(ann_id),
            number INTEGER,
            type INTEGER,
            uploaded BOOLEAN,
            rebroadcast BOOLEAN,
            dub BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS artist (
            artist_id INTEGER PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS artist_alt_name (
            artist_id INTEGER,
            alt_id INTEGER,
            FOREIGN KEY (artist_id) REFERENCES artist(artist_id),
            FOREIGN KEY (alt_id) REFERENCES artist(artist_id)
        );

        CREATE TABLE IF NOT EXISTS groups (
            group_id INTEGER PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE IF NOT EXISTS group_alt_name (
            main_group_id INTEGER,
            alt_group_id INTEGER,
            PRIMARY KEY (main_group_id, alt_group_id),
            FOREIGN KEY (main_group_id) REFERENCES groups(group_id),
            FOREIGN KEY (alt_group_id) REFERENCES groups(group_id)
        );

        CREATE TABLE IF NOT EXISTS group_artist (
            artist_id INTEGER,
            group_id INTEGER,
            FOREIGN KEY (artist_id) REFERENCES artist(artist_id),
            FOREIGN KEY (group_id) REFERENCES groups(group_id)
        );

        CREATE TABLE IF NOT EXISTS group_group (
            parent_group_id INTEGER,
            child_group_id INTEGER,
            FOREIGN KEY (parent_group_id) REFERENCES groups(group_id),
            FOREIGN KEY (child_group_id) REFERENCES groups(group_id)
        );

        -- ===== MANUALLY MANAGED TABLES (user imports data) =====
        
        CREATE TABLE IF NOT EXISTS anime_list (
            ann_id INTEGER PRIMARY KEY,
            mal_id INTEGER,
            kitsu_id INTEGER,
            anilist_id INTEGER,
            FOREIGN KEY (ann_id) REFERENCES anime(ann_id)
        );

        CREATE TABLE IF NOT EXISTS anime_genre (
            ann_id INTEGER,
            genre_name TEXT NOT NULL,
            FOREIGN KEY (ann_id) REFERENCES anime(ann_id),
            PRIMARY KEY (ann_id, genre_name),
            CHECK (LENGTH(genre_name) > 0 AND LENGTH(genre_name) <= 100)
        );

        CREATE TABLE IF NOT EXISTS anime_tag (
            ann_id INTEGER,
            tag_name TEXT NOT NULL,
            FOREIGN KEY (ann_id) REFERENCES anime(ann_id),
            PRIMARY KEY (ann_id, tag_name),
            CHECK (LENGTH(tag_name) > 0 AND LENGTH(tag_name) <= 100)
        );

        CREATE TABLE IF NOT EXISTS song_urls (
            ann_song_id INTEGER PRIMARY KEY,
            difficulty REAL CHECK (difficulty IS NULL OR (difficulty >= 0 AND difficulty <= 100)),
            hq TEXT CHECK (hq IS NULL OR LENGTH(hq) <= 500),
            mq TEXT CHECK (mq IS NULL OR LENGTH(mq) <= 500),
            audio TEXT CHECK (audio IS NULL OR LENGTH(audio) <= 500),
            length REAL CHECK (length IS NULL OR (length > 0 AND length <= 3600)),
            FOREIGN KEY (ann_song_id) REFERENCES song_links(ann_song_id)
        );

        -- ===== INDEXES FOR JSON-IMPORTED TABLES =====
        
        -- Anime indexes - ann_id index used during DELETE and data operations
        CREATE INDEX IF NOT EXISTS idx_anime_names_ann_id ON anime_names(ann_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_names_language ON anime_names(language);
        -- CREATE INDEX IF NOT EXISTS idx_anime_names_main ON anime_names(is_main);
        -- CREATE INDEX IF NOT EXISTS idx_anime_names_name ON anime_names(name);
        -- CREATE INDEX IF NOT EXISTS idx_anime_year_season ON anime(year, season_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_category ON anime(category);
        
        -- Song links indexes - song_id index used during foreign key validation
        CREATE INDEX IF NOT EXISTS idx_song_links_song_id ON song_links(song_id);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_ann_id ON song_links(ann_id);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_type ON song_links(type);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_uploaded ON song_links(uploaded);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_number ON song_links(number);
        
        -- Song indexes - artist/group indexes used in data lookups during import
        CREATE INDEX IF NOT EXISTS idx_song_artist ON song(song_artist_id);
        CREATE INDEX IF NOT EXISTS idx_song_composer ON song(composer_artist_id);
        CREATE INDEX IF NOT EXISTS idx_song_arranger ON song(arranger_artist_id);
        CREATE INDEX IF NOT EXISTS idx_song_group ON song(song_group_id);
        CREATE INDEX IF NOT EXISTS idx_song_composer_group ON song(composer_group_id);
        CREATE INDEX IF NOT EXISTS idx_song_arranger_group ON song(arranger_group_id);
        -- CREATE INDEX IF NOT EXISTS idx_song_category ON song(category);
        -- CREATE INDEX IF NOT EXISTS idx_song_name ON song(name);
        
        -- Artist indexes - used during artist import and alt_name lookups
        -- CREATE INDEX IF NOT EXISTS idx_artist_name ON artist(name);
        -- CREATE INDEX IF NOT EXISTS idx_artist_alt_name_artist ON artist_alt_name(artist_id);
        -- CREATE INDEX IF NOT EXISTS idx_artist_alt_name_alt ON artist_alt_name(alt_id);
        
        -- Group indexes - used during group import and relationships
        -- CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
        -- CREATE INDEX IF NOT EXISTS idx_group_alt_name_main ON group_alt_name(main_group_id);
        -- CREATE INDEX IF NOT EXISTS idx_group_alt_name_alt ON group_alt_name(alt_group_id);
        -- CREATE INDEX IF NOT EXISTS idx_group_artist_group ON group_artist(group_id);
        -- CREATE INDEX IF NOT EXISTS idx_group_artist_artist ON group_artist(artist_id);
        -- CREATE INDEX IF NOT EXISTS idx_group_group_parent ON group_group(parent_group_id);
        -- CREATE INDEX IF NOT EXISTS idx_group_group_child ON group_group(child_group_id);
        
        -- Composite indexes for complex queries
        -- CREATE INDEX IF NOT EXISTS idx_anime_year_category ON anime(year, category);
        -- CREATE INDEX IF NOT EXISTS idx_song_artist_category ON song(song_artist_id, category);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_ann_id ON song_links(ann_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_names_lang_main ON anime_names(language, is_main);
        
        -- MORE selective indexes used by the view / materialized table
        -- CREATE INDEX IF NOT EXISTS idx_anime_names_ann_lang_main ON anime_names(ann_id, language, is_main);
        -- CREATE INDEX IF NOT EXISTS idx_song_links_ann_number ON song_links(ann_id, number);

        -- Unique constraints to prevent duplicates
        CREATE UNIQUE INDEX IF NOT EXISTS idx_anime_names_unique ON anime_names(ann_id, language, name);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_group_artist_unique ON group_artist(artist_id, group_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_group_group_unique ON group_group(parent_group_id, child_group_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_alt_unique ON artist_alt_name(artist_id, alt_id);
        
        -- ===== INDEXES FOR MANUALLY MANAGED TABLES =====
        
        -- anime_list indexes
        -- CREATE INDEX IF NOT EXISTS idx_anime_list_mal_id ON anime_list(mal_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_list_kitsu_id ON anime_list(kitsu_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_list_anilist_id ON anime_list(anilist_id);
        
        -- anime_genre/anime_tag indexes (optimized for direct text search)
        -- CREATE INDEX IF NOT EXISTS idx_anime_genre_ann_id ON anime_genre(ann_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_genre_name ON anime_genre(genre_name);
        -- CREATE INDEX IF NOT EXISTS idx_anime_tag_ann_id ON anime_tag(ann_id);
        -- CREATE INDEX IF NOT EXISTS idx_anime_tag_name ON anime_tag(tag_name);
        
        -- song_urls indexes - including all URL fields for efficient filtering
        CREATE INDEX IF NOT EXISTS idx_song_urls_ann_song_id ON song_urls(ann_song_id);
        -- CREATE INDEX IF NOT EXISTS idx_song_urls_difficulty ON song_urls(difficulty);
        -- CREATE INDEX IF NOT EXISTS idx_song_urls_length ON song_urls(length);
        -- CREATE INDEX IF NOT EXISTS idx_song_urls_hq ON song_urls(hq);
        -- CREATE INDEX IF NOT EXISTS idx_song_urls_mq ON song_urls(mq);
        -- CREATE INDEX IF NOT EXISTS idx_song_urls_audio ON song_urls(audio);

        -- ----------------------------------------------------------------- 
        -- VIEW: song_full (COMMENTED OUT - NOT USED)
        -- ----------------------------------------------------------------- 
        -- DROP VIEW IF EXISTS song_full;
        -- CREATE VIEW song_full AS
        -- SELECT
        --     sl.ann_song_id,
        --     sl.ann_id,
        --     an_ja.name AS anime_name_ja,
        --     an_en.name AS anime_name_en,
        --     s.song_id,
        --     s.name AS song_name,
        --     COALESCE(ar_per.name, gr_per.name) AS artist_name,
        --     COALESCE(ar_comp.name, gr_comp.name) AS composer_name,
        --     COALESCE(ar_arr.name, gr_arr.name) AS arranger_name,
        --     sl.rebroadcast,
        --     sl.dub,
        --     su.hq, su.mq, su.audio, su.difficulty
        -- FROM song_links sl
        -- JOIN song s ON sl.song_id = s.song_id
        -- LEFT JOIN anime a ON sl.ann_id = a.ann_id
        -- LEFT JOIN anime_names an_ja ON a.ann_id = an_ja.ann_id AND an_ja.language = 'JA' AND an_ja.is_main = 1
        -- LEFT JOIN anime_names an_en ON a.ann_id = an_en.ann_id AND an_en.language = 'EN' AND an_en.is_main = 1
        -- LEFT JOIN artist ar_per ON s.song_artist_id = ar_per.artist_id
        -- LEFT JOIN groups gr_per ON s.song_group_id = gr_per.group_id
        -- LEFT JOIN artist ar_comp ON s.composer_artist_id = ar_comp.artist_id
        -- LEFT JOIN groups gr_comp ON s.composer_group_id = gr_comp.group_id
        -- LEFT JOIN artist ar_arr ON s.arranger_artist_id = ar_arr.artist_id
        -- LEFT JOIN groups gr_arr ON s.arranger_group_id = gr_arr.group_id
        -- LEFT JOIN song_urls su ON sl.ann_song_id = su.ann_song_id;
        """)
        conn.commit()
        logger.info("✅ Schema đã được khởi tạo HOÀN CHỈNH - Cả JSON tables và manual tables")
        #logger.info("📥 anisongdb.py chỉ import vào: anime, anime_names, song, song_links, artist, artist_alt_name, groups, group_alt_name, group_artist, group_group")
        #logger.info("🔧 Các bảng khác do bạn tự quản lý: song_urls, anime_list, anime_genre, anime_tag")
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi khởi tạo schema: {e}")
        raise

def validate_anime(anime: Dict[str, Any]) -> bool:
    """Validate anime data"""
    required_fields = ["annId", "category", "year", "seasonId"]
    for field in required_fields:
        if field not in anime:
            logger.warning(f"⚠️ Thiếu trường {field} trong anime {anime.get('annId', 'Unknown')}")
            return False
    
    # Validate category structure (có thể là dict hoặc string)
    category = anime.get("category")
    if isinstance(category, dict):
        # Đảm bảo dict có trường "name"
        if "name" not in category:
            logger.warning(f"⚠️ category dict thiếu trường 'name' trong anime {anime.get('annId')}")
            return False
    elif not isinstance(category, str):
        logger.warning(f"⚠️ category phải là dict hoặc string, nhận: {type(category)} trong anime {anime.get('annId')}")
        return False
    
    return True

def validate_song(song: Dict[str, Any]) -> bool:
    """Validate song data"""
    required_fields = ["songId", "name", "category"]
    for field in required_fields:
        if field not in song:
            logger.warning(f"⚠️ Thiếu trường {field} trong song {song.get('songId', 'Unknown')}")
            return False
        # Đảm bảo các giá trị không phải dict
        if isinstance(song[field], dict):
            logger.warning(f"⚠️ Trường {field} trong song {song.get('songId')} là dict, loại bỏ")
            return False
    return True

def validate_artist(artist: Dict[str, Any]) -> bool:
    """Validate artist data"""
    required_fields = ["songArtistId", "name"]
    for field in required_fields:
        if field not in artist:
            logger.warning(f"⚠️ Thiếu trường {field} trong artist {artist.get('songArtistId', 'Unknown')}")
            return False
        # Đảm bảo các giá trị không phải dict
        if isinstance(artist[field], dict):
            logger.warning(f"⚠️ Trường {field} trong artist {artist.get('songArtistId')} là dict, loại bỏ")
            return False
    return True

def validate_group(group: Dict[str, Any]) -> bool:
    """Validate group data"""
    required_fields = ["songGroupId", "name"]
    for field in required_fields:
        if field not in group:
            logger.warning(f"⚠️ Thiếu trường {field} trong group {group.get('songGroupId', 'Unknown')}")
            return False
        # Đảm bảo các giá trị không phải dict
        if isinstance(group[field], dict):
            logger.warning(f"⚠️ Trường {field} trong group {group.get('songGroupId')} là dict, loại bỏ")
            return False
    return True

def import_artist(artist_data: Dict[str, Any], conn: sqlite3.Connection) -> None:
    """Import artist data using batch insert (delta import)"""
    if not artist_data:
        logger.warning("⚠️ Không có dữ liệu artist để import")
        return
    
    cur = conn.cursor()
    try:
        existing_ids = get_existing_ids(conn, "artist", "artist_id")
        new_ids, exist_ids = find_new_and_existing(artist_data, existing_ids, "songArtistId")
        artist_records = []
        alt_name_records = []
        
        for artist in artist_data.values():
            if not validate_artist(artist):
                continue
            
            artist_id = artist["songArtistId"]
            if artist_id in new_ids or artist_id in exist_ids:
                artist_records.append((artist_id, artist["name"]))
                
                for alt_id in artist.get("altNameLinks", []):
                    alt_name_records.append((artist_id, alt_id))
        
        if artist_records:
            cur.executemany("""
                INSERT OR REPLACE INTO artist (artist_id, name)
                VALUES (?, ?)
            """, artist_records)
            
            # Log chi tiết số lượng mới vs cập nhật
            new_artists = [a for a in artist_records if a[0] in new_ids]
            updated_artists = [a for a in artist_records if a[0] in exist_ids]
            new_count = len(new_artists)
            updated_count = len(updated_artists)
            logger.info(f"✅ Đã import {len(artist_records)} artists: {new_count} mới, {updated_count} cập nhật")
            
            # Chỉ log đặc biệt khi có artists mới (không phải tạo database từ đầu)
            if existing_ids and new_count > 0:
                logger.info(f"🆕 Phát hiện {new_count} artists mới được thêm vào!")
                # Log tên các artists mới (tối đa 3 để không spam log)
                new_names = [f"{a[1]} (ID: {a[0]})" for a in new_artists[:3]]
                logger.info(f"   📝 Artists mới: {', '.join(new_names)}")
                if new_count > 3:
                    logger.info(f"   ... và {new_count - 3} artists khác")
        
        if alt_name_records:
            cur.executemany("""
                INSERT OR IGNORE INTO artist_alt_name (artist_id, alt_id)
                VALUES (?, ?)
            """, alt_name_records)
            logger.info(f"✅ Đã import {len(alt_name_records)} alt names")
        
        conn.commit()
        
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi import artist: {e}")
        conn.rollback()
        raise

def import_group(group_data: Dict[str, Any], conn: sqlite3.Connection) -> None:
    """Import group data using batch insert (delta import)"""
    if not group_data:
        logger.warning("⚠️ Không có dữ liệu group để import")
        return
    cur = conn.cursor()
    try:
        existing_ids = get_existing_ids(conn, "groups", "group_id")
        new_ids, exist_ids = find_new_and_existing(group_data, existing_ids, "songGroupId")
        group_records = []
        group_artist_records = []
        group_group_records = []
        group_alt_name_records = []
        for group in group_data.values():
            if not validate_group(group):
                continue
            group_id = group["songGroupId"]
            if group_id in new_ids or group_id in exist_ids:
                group_records.append((group_id, group["name"]))
                for artist_id in group.get("artistMembers", []):
                    group_artist_records.append((group_id, artist_id))
                for child_id in group.get("groupMembers", []):
                    group_group_records.append((group_id, child_id))
                for alt_group_id in group.get("altNameLinks", []):
                    group_alt_name_records.append((group_id, alt_group_id))
        if group_records:
            cur.executemany("""
                INSERT OR REPLACE INTO groups (group_id, name)
                VALUES (?, ?)
            """, group_records)
            
            # Log chi tiết số lượng mới vs cập nhật
            new_groups = [g for g in group_records if g[0] in new_ids]
            updated_groups = [g for g in group_records if g[0] in exist_ids]
            new_count = len(new_groups)
            updated_count = len(updated_groups)
            logger.info(f"✅ Đã import {len(group_records)} groups: {new_count} mới, {updated_count} cập nhật")
            
            # Chỉ log đặc biệt khi có groups mới (không phải tạo database từ đầu)
            if existing_ids and new_count > 0:
                logger.info(f"🆕 Phát hiện {new_count} groups mới được thêm vào!")
                # Log tên các groups mới (tối đa 3 để không spam log)
                new_names = [f"{g[1]} (ID: {g[0]})" for g in new_groups[:3]]
                logger.info(f"   📝 Groups mới: {', '.join(new_names)}")
                if new_count > 3:
                    logger.info(f"   ... và {new_count - 3} groups khác")
        if group_artist_records:
            cur.executemany("""
                INSERT OR IGNORE INTO group_artist (group_id, artist_id)
                VALUES (?, ?)
            """, group_artist_records)
            logger.info(f"✅ Đã import {len(group_artist_records)} group-artist relationships")
        if group_group_records:
            cur.executemany("""
                INSERT OR IGNORE INTO group_group (parent_group_id, child_group_id)
                VALUES (?, ?)
            """, group_group_records)
            logger.info(f"✅ Đã import {len(group_group_records)} group-group relationships")
        if group_alt_name_records:
            cur.executemany("""
                INSERT OR IGNORE INTO group_alt_name (main_group_id, alt_group_id)
                VALUES (?, ?)
            """, group_alt_name_records)
            logger.info(f"✅ Đã import {len(group_alt_name_records)} group alternative names")
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi import group: {e}")
        conn.rollback()
        raise

def import_song(song_data: Dict[str, Any], conn: sqlite3.Connection) -> None:
    """Import song data using batch insert (delta import)"""
    if not song_data:
        logger.warning("⚠️ Không có dữ liệu song để import")
        return
    cur = conn.cursor()
    try:
        existing_ids = get_existing_ids(conn, "song", "song_id")
        new_ids, exist_ids = find_new_and_existing(song_data, existing_ids, "songId")
        song_records = []
        for song in song_data.values():
            if not validate_song(song):
                continue
            song_id = song["songId"]
            if song_id in new_ids or song_id in exist_ids:
                song_records.append((
                    song_id, song["name"],
                    song.get("songArtistId"),
                    song.get("composerArtistId"),
                    song.get("arrangerArtistId"),
                    song.get("songGroupId"),
                    song.get("composerGroupId"),
                    song.get("arrangerGroupId"),
                    song["category"]
                ))
        
        if song_records:
            cur.executemany("""
                INSERT OR REPLACE INTO song (
                    song_id, name,
                    song_artist_id, composer_artist_id, arranger_artist_id,
                    song_group_id, composer_group_id, arranger_group_id,
                    category
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, song_records)
            
            # Log chi tiết số lượng mới vs cập nhật
            new_songs = [s for s in song_records if s[0] in new_ids]
            updated_songs = [s for s in song_records if s[0] in exist_ids]
            new_count = len(new_songs)
            updated_count = len(updated_songs)
            logger.info(f"✅ Đã import {len(song_records)} songs: {new_count} mới, {updated_count} cập nhật")
            
            if existing_ids and new_count > 0:
                logger.info(f"🆕 Phát hiện {new_count} songs mới được thêm vào!")
                new_names = [f'"{s[1]}" (ID: {s[0]})' for s in new_songs[:3]]
                logger.info(f"   📝 Songs mới: {', '.join(new_names)}")
                if new_count > 3:
                    logger.info(f"   ... và {new_count - 3} songs khác")
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi import song: {e}")
        conn.rollback()
        raise

def import_anime(anime_data: Dict[str, Any], conn: sqlite3.Connection) -> None:
    """Import anime data using batch insert (delta import)"""
    if not anime_data:
        logger.warning("⚠️ Không có dữ liệu anime để import")
        return
    cur = conn.cursor()
    try:
        existing_ids = get_existing_ids(conn, "anime", "ann_id")
        new_ids, exist_ids = find_new_and_existing(anime_data, existing_ids, "annId")
        anime_records = []
        name_records = []
        link_records = []
        for anime in anime_data.values():
            if not validate_anime(anime):
                continue
            ann_id = anime["annId"]
            if ann_id in new_ids or ann_id in exist_ids:
                # Extract category name và number từ JSON
                category_data = anime.get("category")
                if isinstance(category_data, dict):
                    category_name = category_data.get("name")
                    category_number = category_data.get("number")
                else:
                    # Fallback nếu category là string (old format)
                    category_name = category_data
                    category_number = None
                
                anime_records.append((ann_id, category_name, category_number, anime["year"], anime["seasonId"]))
                
                # Import names
                main_names = anime.get("mainNames", {})
                for name_obj in anime.get("names", []):
                    lang = name_obj["language"]
                    name = name_obj["name"]
                    is_main = int(main_names.get(lang) == name)
                    name_records.append((ann_id, lang, name, is_main))
                
                # Import song links with rebroadcast and dub info
                for song_type, links in anime.get("songLinks", {}).items():
                    if not isinstance(links, list):
                        logger.warning(f"⚠️ songLinks[{song_type}] không phải list, loại bỏ")
                        continue
                    for link in links:
                        if not isinstance(link, dict):
                            logger.warning(f"⚠️ link item không phải dict, loại bỏ")
                            continue
                        # Validate và extract các giá trị từ link
                        ann_song_id = link.get("annSongId")
                        song_id = link.get("songId")
                        if ann_song_id is None or song_id is None:
                            logger.warning(f"⚠️ Link thiếu annSongId hoặc songId: {link}")
                            continue
                        
                        # Đảm bảo các giá trị là số nguyên hoặc Boolean
                        try:
                            link_records.append((
                                int(ann_song_id),
                                int(song_id),
                                ann_id,
                                int(link.get("number", 0)),
                                int(link.get("type", 0)),
                                int(bool(link.get("uploaded", False))),
                                int(bool(link.get("rebroadcast", False))),
                                int(bool(link.get("dub", False)))
                            ))
                        except (ValueError, TypeError) as e:
                            logger.warning(f"⚠️ Lỗi convert link values: {e}, link: {link}")

        if anime_records:
            cur.executemany("""
                INSERT OR REPLACE INTO anime (ann_id, category, category_number, year, season_id)
                VALUES (?, ?, ?, ?, ?)
            """, anime_records)
            
            # Log chi tiết số lượng mới vs cập nhật
            new_anime = [a for a in anime_records if a[0] in new_ids]
            updated_anime = [a for a in anime_records if a[0] in exist_ids]
            new_count = len(new_anime)
            updated_count = len(updated_anime)
            logger.info(f"✅ Đã import {len(anime_records)} anime: {new_count} mới, {updated_count} cập nhật")
            
            # Chỉ log đặc biệt khi có anime mới (không phải tạo database từ đầu)
            if existing_ids and new_count > 0:
                logger.info(f"🆕 Phát hiện {new_count} anime mới được thêm vào!")
                # Log tên các anime mới với tên chính từ JSON data
                new_anime_details = []
                for ann_id, _, _, year, _ in new_anime[:3]:
                    # Tìm anime trong data gốc để lấy tên chính
                    for anime in anime_data.values():
                        if anime.get("annId") == ann_id:
                            main_names = anime.get("mainNames", {})
                            # Ưu tiên English > Japanese > tên đầu tiên
                            
                            name = (main_names.get("Japanese") or 
                                   main_names.get("English") or 
                                   main_names.get("Romaji") or
                                   list(main_names.values())[0] if main_names else f"ANN:{ann_id}")
                            new_anime_details.append(f'"{name}" ({year}) (ID: {ann_id})')
                            break
                logger.info(f"   📝 Anime mới: {', '.join(new_anime_details)}")
                if new_count > 3:
                    logger.info(f"   ... và {new_count - 3} anime khác")
        if name_records:
            anime_ids = [record[0] for record in anime_records]
            cur.executemany("DELETE FROM anime_names WHERE ann_id = ?", [(aid,) for aid in anime_ids])
            cur.executemany("""
                INSERT INTO anime_names (ann_id, language, name, is_main)
                VALUES (?, ?, ?, ?)
            """, name_records)
            logger.info(f"✅ Đã import {len(name_records)} anime names")
        if link_records:
            # Validate song_id foreign key - chỉ import links có song_id hợp lệ
            song_ids = set(l[1] for l in link_records)
            if song_ids:  # Chỉ thực hiện nếu có song_ids để check
                cur.execute(f"SELECT song_id FROM song WHERE song_id IN ({','.join('?' for _ in song_ids)})", tuple(song_ids))
                valid_song_ids = set(row[0] for row in cur.fetchall())
                valid_links = [l for l in link_records if l[1] in valid_song_ids]
                dropped = len(link_records) - len(valid_links)
                if dropped > 0:
                    logger.warning(f"⚠️ Đã loại bỏ {dropped} song_links do song_id không tồn tại.")
                
                if valid_links:
                    cur.executemany("""
                        INSERT OR REPLACE INTO song_links (
                            ann_song_id, song_id, ann_id,
                            number, type, uploaded,
                            rebroadcast, dub
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, valid_links)
                    logger.info(f"✅ Đã import {len(valid_links)} song links")
                else:
                    logger.warning("⚠️ Không có song_links hợp lệ nào để import")
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi import anime: {e}")
        conn.rollback()
        raise

# Utility functions cho URL management
def add_url(conn: sqlite3.Connection, ann_song_id: int, hq: str = None, 
           mq: str = None, audio: str = None, difficulty: float = None, 
           length: float = None) -> bool:
    """Thêm hoặc cập nhật URLs cho một song - tất cả fields có thể NULL"""
    cur = conn.cursor()
    try:
        # Validate difficulty range if provided
        if difficulty is not None and (difficulty < 0 or difficulty > 100):
            logger.error(f"❌ Difficulty phải từ 0-100 hoặc NULL, nhận: {difficulty}")
            return False
            
        cur.execute("""
            INSERT OR REPLACE INTO song_urls (ann_song_id, hq, mq, audio, difficulty, length)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ann_song_id, hq, mq, audio, difficulty, length))
        conn.commit()
        logger.info(f"✅ Đã cập nhật URLs cho song {ann_song_id}")
        return True
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi cập nhật URLs: {e}")
        return False

def get_song_urls(conn: sqlite3.Connection, ann_song_id: int) -> dict:
    """Lấy tất cả URLs của một song"""
    cur = conn.cursor()
    cur.execute("""
        SELECT hq, mq, audio, difficulty, length
        FROM song_urls 
        WHERE ann_song_id = ?
    """, (ann_song_id,))
    result = cur.fetchone()
    if result:
        return {
            'hq': result[0],
            'mq': result[1], 
            'audio': result[2],
            'difficulty': result[3],
            'length': result[4]
        }
    return {}

def update_specific_url(conn: sqlite3.Connection, ann_song_id: int, 
                       quality_type: str, url: str) -> bool:
    """Cập nhật URL cho một quality cụ thể"""
    if quality_type not in ['hq', 'mq', 'audio']:
        logger.error(f"❌ Quality type không hợp lệ: {quality_type}")
        return False
    
    cur = conn.cursor()
    try:
        # Lấy URLs hiện tại
        cur.execute("SELECT hq, mq, audio FROM song_urls WHERE ann_song_id = ?", (ann_song_id,))
        result = cur.fetchone()
        
        if result:
            # Cập nhật URL cụ thể
            hq, mq, audio = result
            if quality_type == 'hq':
                hq = url
            elif quality_type == 'mq':
                mq = url
            elif quality_type == 'audio':
                audio = url
                
            cur.execute("""
                UPDATE song_urls SET hq = ?, mq = ?, audio = ?
                WHERE ann_song_id = ?
            """, (hq, mq, audio, ann_song_id))
        else:
            # Tạo record mới
            if quality_type == 'hq':
                cur.execute("INSERT INTO song_urls (ann_song_id, hq) VALUES (?, ?)", (ann_song_id, url))
            elif quality_type == 'mq':
                cur.execute("INSERT INTO song_urls (ann_song_id, mq) VALUES (?, ?)", (ann_song_id, url))
            elif quality_type == 'audio':
                cur.execute("INSERT INTO song_urls (ann_song_id, audio) VALUES (?, ?)", (ann_song_id, url))
        
        conn.commit()
        logger.info(f"✅ Đã cập nhật {quality_type} URL cho song {ann_song_id}")
        return True
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi cập nhật {quality_type} URL: {e}")
        return False

def remove_url(conn: sqlite3.Connection, ann_song_id: int, quality_type: str = None) -> bool:
    """Xóa URL - nếu không chỉ định quality_type thì xóa tất cả"""
    cur = conn.cursor()
    try:
        if quality_type and quality_type in ['hq', 'mq', 'audio']:
            # Xóa URL cụ thể bằng cách set NULL
            cur.execute(f"""
                UPDATE song_urls SET {quality_type} = NULL
                WHERE ann_song_id = ?
            """, (ann_song_id,))
            logger.info(f"✅ Đã xóa {quality_type} URL cho song {ann_song_id}")
        else:
            # Xóa toàn bộ record
            cur.execute("DELETE FROM song_urls WHERE ann_song_id = ?", (ann_song_id,))
            logger.info(f"✅ Đã xóa tất cả URLs cho song {ann_song_id}")
        
        conn.commit()
        return True
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi xóa URLs: {e}")
        return False

def demonstrate_index_performance(conn: sqlite3.Connection) -> None:
    """Demo hiệu suất của indexes"""
    import time
    
    logger.info("🔍 Demo hiệu suất indexes...")
    cur = conn.cursor()
    
    # Test 1: Tìm anime theo tên (sử dụng idx_anime_names_name)
    start_time = time.time()
    cur.execute("SELECT COUNT(*) FROM anime_names WHERE name LIKE '%Attack%'")
    result1 = cur.fetchone()[0]
    time1 = time.time() - start_time
    logger.info(f"📊 Test 1 - Tìm anime theo tên: {result1} kết quả trong {time1:.4f}s")
    
    # Test 2: JOIN phức tạp (sử dụng multiple indexes)
    start_time = time.time()
    cur.execute("""
        SELECT COUNT(*) 
        FROM anime a
        JOIN song_links sl ON a.ann_id = sl.ann_id
        JOIN song s ON sl.song_id = s.song_id
        WHERE a.year >= 2020 AND s.category = 1
    """)
    result2 = cur.fetchone()[0]
    time2 = time.time() - start_time
    logger.info(f"📊 Test 2 - JOIN anime-songs: {result2} kết quả trong {time2:.4f}s")
    
    # Test 3: Aggregate query (sử dụng category index)
    start_time = time.time()
    cur.execute("""
        SELECT s.category, COUNT(*) 
        FROM song s 
        GROUP BY s.category 
        ORDER BY COUNT(*) DESC
    """)
    result3 = cur.fetchall()
    time3 = time.time() - start_time
    logger.info(f"📊 Test 3 - Thống kê theo category: {len(result3)} categories trong {time3:.4f}s")
    
    # Test 4: Complex search với artist names (sử dụng idx_artist_name)
    start_time = time.time()
    cur.execute("""
        SELECT a.name, COUNT(s.song_id) as song_count
        FROM artist a
        LEFT JOIN song s ON a.artist_id = s.song_artist_id
        WHERE a.name LIKE '%Yoko%'
        GROUP BY a.artist_id, a.name
        ORDER BY song_count DESC
        LIMIT 10
    """)
    result4 = cur.fetchall()
    time4 = time.time() - start_time
    logger.info(f"📊 Test 4 - Tìm artist và đếm songs: {len(result4)} nghệ sĩ trong {time4:.4f}s")
    
    # Test 5: Composite index test (year + category)
    start_time = time.time()
    cur.execute("""
        SELECT a.year, a.category, COUNT(*) as anime_count
        FROM anime a
        WHERE a.year BETWEEN 2018 AND 2022
        GROUP BY a.year, a.category
        ORDER BY a.year DESC, anime_count DESC
    """)
    result5 = cur.fetchall()
    time5 = time.time() - start_time
    logger.info(f"📊 Test 5 - Composite index (year+category): {len(result5)} groups trong {time5:.4f}s")
    
    # Test 6: Foreign key JOIN performance - use sl.rebroadcast (per-link)
    start_time = time.time()
    cur.execute("""
        SELECT COUNT(DISTINCT s.song_id)
        FROM song s
        JOIN song_links sl ON s.song_id = sl.song_id
        JOIN anime a ON sl.ann_id = a.ann_id
        WHERE a.year >= 2020
        AND sl.rebroadcast = 0
        AND sl.uploaded = 1
    """)
    result6 = cur.fetchone()[0]
    time6 = time.time() - start_time
    logger.info(f"📊 Test 6 - Multi-table JOIN với filters: {result6} songs trong {time6:.4f}s")
    
    total_time = time1 + time2 + time3 + time4 + time5 + time6
    logger.info(f"🎯 Tổng thời gian 6 tests: {total_time:.4f}s")
    logger.info("✅ Demo hoàn tất - Indexes giúp queries nhanh hơn đáng kể!")
    
    # Bonus: Hiển thị một số kết quả mẫu
    if result4:
        logger.info("🎵 Top artists có tên chứa 'Yoko':")
        for artist_name, song_count in result4[:3]:
            logger.info(f"   - {artist_name}: {song_count} bài hát")
    
    if result5:
        logger.info("📅 Anime theo năm gần đây:")
        for year, category, count in result5[:5]:
            logger.info(f"   - {year} (category {category}): {count} anime")

def main():
    """Main function with proper error handling"""
    import time
    start_time = time.time()
    
    # File paths
    anime_path = "animeMap.json"
    song_path = "songMap.json"
    artist_path = "artistMap.json"
    group_path = "groupMap.json"
    db_path = "anisong.db"
    
    conn = None
    try:
        logger.info("🚀 Bắt đầu quá trình import với schema mới...")
        
        # Load all data
        logger.info("📂 Đang tải dữ liệu từ JSON files...")
        load_start = time.time()
        anime_data = load_json(anime_path)
        song_data = load_json(song_path)
        artist_data = load_json(artist_path)
        group_data = load_json(group_path)
        load_time = time.time() - load_start
        logger.info(f"✅ Tải dữ liệu hoàn tất trong {load_time:.2f}s")
        
        # Check if we have any data
        if not any([anime_data, song_data, artist_data, group_data]):
            logger.error("❌ Không có dữ liệu để import!")
            return
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key constraints
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;") # -- Tăng tốc độ ghi đáng kể
        # Initialize schema
        init_schema(conn)
        
        # NOTE: song_urls table sẽ do user tự quản lý, không import từ JSON
        
        # Import in correct order (respecting foreign key constraints)
        logger.info("📥 Bắt đầu import theo thứ tự với delta import...")
        import_start = time.time()
        
        # 1. Import artists and groups first (no dependencies)
        logger.info("📥 Bước 1: Import artists và groups...")
        step1_start = time.time()
        import_artist(artist_data, conn)
        import_group(group_data, conn)
        step1_time = time.time() - step1_start
        logger.info(f"✅ Bước 1 hoàn tất trong {step1_time:.2f}s")
        
        # 2. Import songs (depends on artists/groups) - PHẢI TRƯỚC anime
        logger.info("📥 Bước 2: Import songs...")
        step2_start = time.time()
        import_song(song_data, conn)
        step2_time = time.time() - step2_start
        logger.info(f"✅ Bước 2 hoàn tất trong {step2_time:.2f}s")
        
        # 3. Import anime and song links last (depends on songs existing)
        logger.info("📥 Bước 3: Import anime và song links...")
        step3_start = time.time()
        import_anime(anime_data, conn)
        step3_time = time.time() - step3_start
        logger.info(f"✅ Bước 3 hoàn tất trong {step3_time:.2f}s")
        
        import_time = time.time() - import_start
        total_time = time.time() - start_time
        
        logger.info(f"✅ Import hoàn tất thành công trong {import_time:.2f}s (tổng: {total_time:.2f}s)!")
        logger.info("🏗️  Schema đầy đủ đã được tạo cho tất cả tables")
        logger.info("📝 Bạn có thể tự import vào: song_urls, anime_list, anime_genre, anime_tag")
        
    #    # Demo performance với indexes
    #    logger.info("🎯 Bắt đầu demo hiệu suất indexes...")
    #    demonstrate_index_performance(conn)
    #    
    #    # Hiển thị thống kê database
    #    stats = get_database_stats(conn)
    #    logger.info("📊 Thống kê database:")
    #    for table, count in stats.items():
    #        logger.info(f"   {table}: {count:,} records")
    #    
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi database: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        logger.error(f"❌ Lỗi không xác định: {e}")
    finally:
        if conn:
            conn.close()
            logger.info("🔒 Đã đóng kết nối database")

def search_anime_by_name(conn: sqlite3.Connection, search_term: str, language: str = None) -> list:
    """Tìm kiếm anime theo tên"""
    cur = conn.cursor()
    query = """
        SELECT DISTINCT a.ann_id, a.category, a.year, a.season_id, an.name, an.language
        FROM anime a
        JOIN anime_names an ON a.ann_id = an.ann_id
        WHERE an.name LIKE ?
    """
    params = [f"%{search_term}%"]
    
    if language:
        query += " AND an.language = ?"
        params.append(language)
    
    query += " ORDER BY an.is_main DESC, a.year DESC"
    
    cur.execute(query, params)
    return cur.fetchall()

def get_anime_songs(conn: sqlite3.Connection, ann_id: int) -> list:
    """Lấy tất cả bài hát của một anime"""
    cur = conn.cursor()
    cur.execute("""
        SELECT sl.ann_song_id, s.name as song_name, sl.number, sl.type,
               ar.name as artist_name, sg.name as group_name,
               su.hq, su.mq, su.audio, su.difficulty, su.length
        FROM song_links sl
        JOIN song s ON sl.song_id = s.song_id
        LEFT JOIN artist ar ON s.song_artist_id = ar.artist_id
        LEFT JOIN groups sg ON s.song_group_id = sg.group_id
        LEFT JOIN song_urls su ON sl.ann_song_id = su.ann_song_id
        WHERE sl.ann_id = ?
        ORDER BY sl.number
    """, (ann_id,))
    return cur.fetchall()

def get_song_details(conn: sqlite3.Connection, song_id: int) -> dict:
    """Lấy thông tin chi tiết của một bài hát"""
    cur = conn.cursor()
    cur.execute("""
        SELECT s.song_id, s.name,
               ar1.name as artist_name,
               ar2.name as composer_name,
               ar3.name as arranger_name,
               sg1.name as group_name,
               sg2.name as composer_group_name,
               sg3.name as arranger_group_name,
               s.category
        FROM song s
        LEFT JOIN artist ar1 ON s.song_artist_id = ar1.artist_id
        LEFT JOIN artist ar2 ON s.composer_artist_id = ar2.artist_id
        LEFT JOIN artist ar3 ON s.arranger_artist_id = ar3.artist_id
        LEFT JOIN groups sg1 ON s.song_group_id = sg1.group_id
        LEFT JOIN groups sg2 ON s.composer_group_id = sg2.group_id
        LEFT JOIN groups sg3 ON s.arranger_group_id = sg3.group_id
        WHERE s.song_id = ?
    """, (song_id,))
    
    result = cur.fetchone()
    if result:
        return {
            'song_id': result[0],
            'name': result[1],
            'artist': result[2],
            'composer': result[3],
            'arranger': result[4],
            'group': result[5],
            'composer_group': result[6],
            'arranger_group': result[7],
            'category': result[8]
            # rebroadcast/dub are per-ann_song (song_links) and not returned here
        }
    return {}

def get_artist_songs(conn: sqlite3.Connection, artist_id: int) -> list:
    """Lấy tất cả bài hát của một nghệ sĩ"""
    cur = conn.cursor()
    cur.execute("""
        SELECT s.song_id, s.name, 'performer' as role
        FROM song s WHERE s.song_artist_id = ?
        UNION
        SELECT s.song_id, s.name, 'composer' as role
        FROM song s WHERE s.composer_artist_id = ?
        UNION 
        SELECT s.song_id, s.name, 'arranger' as role
        FROM song s WHERE s.arranger_artist_id = ?
        ORDER BY name
    """, (artist_id, artist_id, artist_id))
    return cur.fetchall()

def get_group_members(conn: sqlite3.Connection, group_id: int) -> dict:
    """Lấy thành viên của một nhóm"""
    cur = conn.cursor()
    
    # Lấy artists
    cur.execute("""
        SELECT a.artist_id, a.name
        FROM group_artist ga
        JOIN artist a ON ga.artist_id = a.artist_id
        WHERE ga.group_id = ?
        ORDER BY a.name
    """, (group_id,))
    artists = cur.fetchall()
    
    # Lấy sub-groups
    cur.execute("""
        SELECT sg.group_id, sg.name
        FROM group_group gg
        JOIN groups sg ON gg.child_group_id = sg.group_id
        WHERE gg.parent_group_id = ?
        ORDER BY sg.name
    """, (group_id,))
    subgroups = cur.fetchall()
    
    return {
        'artists': artists,
        'subgroups': subgroups
    }

def get_database_stats(conn: sqlite3.Connection) -> dict:
    """Lấy thống kê tổng quan database"""
    cur = conn.cursor()
    
    stats = {}
    
    # JSON-imported tables
    json_tables = ['anime', 'anime_names', 'song', 'song_links', 'artist', 'artist_alt_name', 'groups', 'group_alt_name', 'group_artist', 'group_group']
    
    # Manually managed tables
    manual_tables = ['song_urls', 'anime_list', 'anime_genre', 'anime_tag']
    
    for table in json_tables + manual_tables:
        try:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            stats[table] = cur.fetchone()[0]
        except sqlite3.Error:
            stats[table] = 0  # Table might not exist or be empty
    
    # Thống kê URLs chi tiết
    try:
        cur.execute("SELECT COUNT(*) FROM song_urls WHERE hq IS NOT NULL")
        stats['hq_urls'] = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM song_urls WHERE mq IS NOT NULL") 
        stats['mq_urls'] = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM song_urls WHERE audio IS NOT NULL")
        stats['audio_urls'] = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM song_urls WHERE difficulty IS NOT NULL")
        stats['urls_with_difficulty'] = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM song_urls WHERE length IS NOT NULL")
        stats['urls_with_length'] = cur.fetchone()[0]
    except sqlite3.Error:
        stats['hq_urls'] = 0
        stats['mq_urls'] = 0
        stats['audio_urls'] = 0
        stats['urls_with_difficulty'] = 0
        stats['urls_with_length'] = 0
    
    return stats

# Database maintenance functions
def vacuum_database(conn: sqlite3.Connection) -> bool:
    """Optimize database size and performance"""
    try:
        conn.execute("VACUUM")
        logger.info("✅ Database đã được optimize")
        return True
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi optimize database: {e}")
        return False

def analyze_database(conn: sqlite3.Connection) -> bool:
    """Update table statistics for query optimizer"""
    try:
        conn.execute("ANALYZE")
        logger.info("✅ Database statistics đã được cập nhật")
        return True
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi analyze database: {e}")
        return False

def check_integrity(conn: sqlite3.Connection) -> bool:
    """Kiểm tra tính toàn vẹn của database"""
    cur = conn.cursor()
    try:
        cur.execute("PRAGMA integrity_check")
        result = cur.fetchone()[0]
        if result == "ok":
            logger.info("✅ Database integrity OK")
            return True
        else:
            logger.error(f"❌ Database integrity issues: {result}")
            return False
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi check integrity: {e}")
        return False

def demonstrate_index_performance(conn: sqlite3.Connection) -> None:
    """Demo hiệu suất của indexes"""
    import time
    
    logger.info("🔍 Demo hiệu suất indexes...")
    cur = conn.cursor()
    
    # Test 1: Tìm anime theo tên (sử dụng idx_anime_names_name)
    start_time = time.time()
    cur.execute("SELECT COUNT(*) FROM anime_names WHERE name LIKE '%Attack%'")
    result1 = cur.fetchone()[0]
    time1 = time.time() - start_time
    logger.info(f"📊 Test 1 - Tìm anime theo tên: {result1} kết quả trong {time1:.4f}s")
    
    # Test 2: JOIN phức tạp (sử dụng multiple indexes)
    start_time = time.time()
    cur.execute("""
        SELECT COUNT(*) 
        FROM anime a
        JOIN song_links sl ON a.ann_id = sl.ann_id
        JOIN song s ON sl.song_id = s.song_id
        WHERE a.year >= 2020 AND s.category = 1
    """)
    result2 = cur.fetchone()[0]
    time2 = time.time() - start_time
    logger.info(f"📊 Test 2 - JOIN anime-songs: {result2} kết quả trong {time2:.4f}s")
    
    # Test 3: Aggregate query (sử dụng category index)
    start_time = time.time()
    cur.execute("""
        SELECT s.category, COUNT(*) 
        FROM song s 
        GROUP BY s.category 
        ORDER BY COUNT(*) DESC
    """)
    result3 = cur.fetchall()
    time3 = time.time() - start_time
    logger.info(f"📊 Test 3 - Thống kê theo category: {len(result3)} categories trong {time3:.4f}s")
    
    # Test 4: Complex search với artist names (sử dụng idx_artist_name)
    start_time = time.time()
    cur.execute("""
        SELECT a.name, COUNT(s.song_id) as song_count
        FROM artist a
        LEFT JOIN song s ON a.artist_id = s.song_artist_id
        WHERE a.name LIKE '%Yoko%'
        GROUP BY a.artist_id, a.name
        ORDER BY song_count DESC
        LIMIT 10
    """)
    result4 = cur.fetchall()
    time4 = time.time() - start_time
    logger.info(f"📊 Test 4 - Tìm artist và đếm songs: {len(result4)} nghệ sĩ trong {time4:.4f}s")
    
    # Test 5: Composite index test (year + category)
    start_time = time.time()
    cur.execute("""
        SELECT a.year, a.category, COUNT(*) as anime_count
        FROM anime a
        WHERE a.year BETWEEN 2018 AND 2022
        GROUP BY a.year, a.category
        ORDER BY a.year DESC, anime_count DESC
    """)
    result5 = cur.fetchall()
    time5 = time.time() - start_time
    logger.info(f"📊 Test 5 - Composite index (year+category): {len(result5)} groups trong {time5:.4f}s")
    
    # Test 6: Foreign key JOIN performance - use sl.rebroadcast (per-link)
    start_time = time.time()
    cur.execute("""
        SELECT COUNT(DISTINCT s.song_id)
        FROM song s
        JOIN song_links sl ON s.song_id = sl.song_id
        JOIN anime a ON sl.ann_id = a.ann_id
        WHERE a.year >= 2020
        AND sl.rebroadcast = 0
        AND sl.uploaded = 1
    """)
    result6 = cur.fetchone()[0]
    time6 = time.time() - start_time
    logger.info(f"📊 Test 6 - Multi-table JOIN với filters: {result6} songs trong {time6:.4f}s")
    
    total_time = time1 + time2 + time3 + time4 + time5 + time6
    logger.info(f"🎯 Tổng thời gian 6 tests: {total_time:.4f}s")
    logger.info("✅ Demo hoàn tất - Indexes giúp queries nhanh hơn đáng kể!")
    
    # Bonus: Hiển thị một số kết quả mẫu
    if result4:
        logger.info("🎵 Top artists có tên chứa 'Yoko':")
        for artist_name, song_count in result4[:3]:
            logger.info(f"   - {artist_name}: {song_count} bài hát")
    
    if result5:
        logger.info("📅 Anime theo năm gần đây:")
        for year, category, count in result5[:5]:
            logger.info(f"   - {year} (category {category}): {count} anime")


def refresh_song_full_mat(conn: sqlite3.Connection, force: bool = True) -> None:
    """Build or refresh materialized table song_full_mat for fast ad-hoc lookups.

    Use this before opening DB Browser for emergency queries. If force=False and the table
    exists, the function will skip rebuilding.
    """
    cur = conn.cursor()
    # Check existence
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='song_full_mat'")
    if cur.fetchone() and not force:
        logger.info("ℹ️ song_full_mat already exists and force=False -> skipping refresh")
        return

    try:
        logger.info("🔧 Building materialized table song_full_mat (this may take some time)...")
        cur.execute("BEGIN")
        cur.execute("DROP TABLE IF EXISTS song_full_mat")

        # Create materialized table with optimized CTE-based query
        cur.execute("""
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

            -- Artist/Group IDs (6 cột để filter theo role)
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
        LEFT JOIN anime_tags_cte AS at ON at.ann_id = sl.ann_id
        """)

        # Create indexes for all numeric fields in song_full_mat
        logger.info("🔧 Creating indexes for song_full_mat...")
        
        # Primary/Foreign Keys
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_ann_song_id ON song_full_mat(ann_song_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_id ON song_full_mat(song_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_ann_id ON song_full_mat(ann_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_mal_id ON song_full_mat(mal_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_anilist_id ON song_full_mat(anilist_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_kitsu_id ON song_full_mat(kitsu_id)")
        
        # Anime Info (for filtering & sorting)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_anime_year ON song_full_mat(anime_year)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_anime_season_id ON song_full_mat(anime_season_id)")
        
        # Song Info (for filtering)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_type_id ON song_full_mat(song_type_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_type_number ON song_full_mat(song_type_number)")
        
        # Artist/Group IDs (for filtering by role)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_artist_id ON song_full_mat(song_artist_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_group_id ON song_full_mat(song_group_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_composer_artist_id ON song_full_mat(composer_artist_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_composer_group_id ON song_full_mat(composer_group_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_arranger_artist_id ON song_full_mat(arranger_artist_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_arranger_group_id ON song_full_mat(arranger_group_id)")
        
        # Files & Attributes (for filtering)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_song_length ON song_full_mat(song_length)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_uploaded ON song_full_mat(is_uploaded)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_dub ON song_full_mat(is_dub)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_is_rebroadcast ON song_full_mat(is_rebroadcast)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_difficulty ON song_full_mat(difficulty)")
        
		cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_hq ON song_full_mat(hq)")
		cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_mq ON song_full_mat(mq)")
		cur.execute("CREATE INDEX IF NOT EXISTS idx_song_full_mat_audio ON song_full_mat(audio)")

        logger.info("✅ Created 27 indexes for song_full_mat")
        
        cur.execute("COMMIT")
        
        # Count rows
        cur.execute("SELECT COUNT(*) FROM song_full_mat")
        count = cur.fetchone()[0]
        logger.info(f"✅ song_full_mat built with {count:,} rows and indexed")
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi build song_full_mat: {e}")
        conn.rollback()
        raise


def rebuild_fts5(conn: sqlite3.Connection) -> None:
    """Rebuild FTS5 virtual table for full-text search.
    
    Uses standalone FTS5 (no external content) so that shadow tables 
    contain actual data and can be synced via sqldiff to D1.
    Must be called AFTER refresh_song_full_mat().
    """
    cur = conn.cursor()
    
    try:
        logger.info("🔧 Building FTS5 index song_search (standalone mode)...")
        
        # Drop existing FTS table
        cur.execute("DROP TABLE IF EXISTS song_search")
        
        # Create FTS5 virtual table WITHOUT content='...'
        # This makes FTS5 store its own copy of data in shadow tables
        # Shadow tables can be diffed by sqldiff and synced to D1
        cur.execute("""
        CREATE VIRTUAL TABLE song_search USING fts5(
            song_name,
            song_artist,
            song_composer,
            song_arranger,
            anime_name_ja,
            anime_name_en,
            anime_alt_names
        )
        """)
        
        # Populate FTS index
        cur.execute("""
        INSERT INTO song_search(rowid, song_name, song_artist, song_composer, song_arranger, 
                                anime_name_ja, anime_name_en, anime_alt_names)
        SELECT ann_song_id, song_name, song_artist, song_composer, song_arranger, 
               anime_name_ja, anime_name_en, anime_alt_names
        FROM song_full_mat
        """)
        
        conn.commit()
        
        # Count rows
        cur.execute("SELECT COUNT(*) FROM song_search")
        count = cur.fetchone()[0]
        logger.info(f"✅ FTS5 song_search built with {count:,} indexed rows")
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi khi build FTS5: {e}")
        conn.rollback()
        raise

def run_performance_demo():
    """Chạy demo hiệu suất riêng biệt"""
    db_path = "anisong.db"
    
    try:
        conn = sqlite3.connect(db_path)
        logger.info("🔗 Kết nối database để demo hiệu suất...")
        
        # Kiểm tra xem database có dữ liệu không
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM anime")
        anime_count = cur.fetchone()[0]
        
        if anime_count == 0:
            logger.warning("⚠️ Database trống! Cần import dữ liệu trước.")
            return
        
        logger.info(f"📊 Database có {anime_count:,} anime records")
        
        # Chạy demo
        demonstrate_index_performance(conn)
        
        # Database maintenance demo
        logger.info("\n🔧 Demo database maintenance...")
        vacuum_database(conn)
        analyze_database(conn) 
        check_integrity(conn)
        
        # Hiển thị stats
        stats = get_database_stats(conn)
        logger.info("\n📊 Database statistics:")
        for table, count in stats.items():
            logger.info(f"   {table}: {count:,} records")
            
    except sqlite3.Error as e:
        logger.error(f"❌ Lỗi database: {e}")
    except Exception as e:
        logger.error(f"❌ Lỗi: {e}")
    finally:
        if conn:
            conn.close()
            logger.info("🔒 Đã đóng kết nối database")

# Thêm các hàm phụ trợ cho delta import và kiểm tra dữ liệu
def get_existing_ids(conn: sqlite3.Connection, table: str, id_column: str) -> Set[Any]:
    cur = conn.cursor()
    cur.execute(f"SELECT {id_column} FROM {table}")
    return set(row[0] for row in cur.fetchall())

def find_new_and_existing(data: Dict[str, Any], existing_ids: Set[Any], id_key: str) -> Tuple[List[Any], List[Any]]:
    new_ids = []
    exist_ids = []
    for v in data.values():
        _id = v.get(id_key)
        if _id is not None:
            if _id in existing_ids:
                exist_ids.append(_id)
            else:
                new_ids.append(_id)
    return new_ids, exist_ids

if __name__ == "__main__":
	import sys

	# Kiểm tra argument để chọn chế độ
	if len(sys.argv) > 1 and sys.argv[1] == "demo":
		logger.info("🎯 Chế độ DEMO - Chỉ test hiệu suất")
		run_performance_demo()
	elif len(sys.argv) > 1 and sys.argv[1] == "materialize":
		# Build materialized song_full_mat only (FTS5 managed by triggers on D1)
		logger.info("🔧 Chạy materialize -> Tạo/refresh song_full_mat")
		db_path = "anisong.db"
		conn = None
		try:
			conn = sqlite3.connect(db_path)
			conn.execute("PRAGMA foreign_keys = ON")
			# Ensure schema exists before building
			init_schema(conn)
			# Force rebuild to ensure fresh data
			refresh_song_full_mat(conn, force=True)
			# Note: FTS5 is managed by triggers on D1, not built locally
		except Exception as e:
			logger.error(f"❌ Lỗi khi materialize: {e}")
		finally:
			if conn:
				conn.close()
				logger.info("🔒 Đã đóng kết nối database")
	else:
		logger.info("📥 Chế độ IMPORT - Import dữ liệu và demo")
		main()