-- PostgreSQL Schema for Personal Media Library & Resource Navigation
-- 影视作品表 (Media)
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    type VARCHAR(50) NOT NULL DEFAULT '电影', -- 电影 / 电视剧 / 动漫
    year INTEGER,
    country VARCHAR(100),
    overview TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    rating NUMERIC(3, 1) DEFAULT 0.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 资源链接表 (Resources)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT '网盘链接', -- 网盘链接 / 磁力链接 / 在线播放
    code VARCHAR(100),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_rating ON media(rating DESC);
CREATE INDEX IF NOT EXISTS idx_media_year ON media(year DESC);
CREATE INDEX IF NOT EXISTS idx_media_updated_at ON media(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_media_id ON resources(media_id);
