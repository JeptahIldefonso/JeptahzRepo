-- Migration 003: Add attached_files, media_items, video_url, and likes_count to entries
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS attached_files JSONB DEFAULT '[]'::jsonb;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS media_items JSONB DEFAULT '[]'::jsonb;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
