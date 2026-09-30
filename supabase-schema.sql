-- SpaceGeo AI — Supabase Database Schema
-- Run this in Supabase SQL Editor: https://nvcccxvkntntwgjknlux.supabase.co

-- ══════════════════════════════════════════════════════════
-- 1. CHAT SESSIONS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT,                          -- NULL = guest session
  title         TEXT NOT NULL DEFAULT 'New Chat',
  cad_software  TEXT NOT NULL DEFAULT 'solidworks',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- ══════════════════════════════════════════════════════════
-- 2. CHAT MESSAGES
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id    TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content       TEXT NOT NULL,
  image_data    TEXT,                          -- base64 image (optional)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- ══════════════════════════════════════════════════════════
-- 3. DAILY USAGE TRACKING
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS daily_usage (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL,               -- guest ID or auth user ID
  date            DATE NOT NULL,
  requests_count  INTEGER NOT NULL DEFAULT 0,
  daily_limit     INTEGER NOT NULL DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);

-- ══════════════════════════════════════════════════════════
-- 4. USER SETTINGS
-- ══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_settings (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT UNIQUE NOT NULL,
  cad_software  TEXT NOT NULL DEFAULT 'solidworks',
  theme         TEXT NOT NULL DEFAULT 'dark',
  language      TEXT NOT NULL DEFAULT 'en',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (RLS) — allow anon access
-- ══════════════════════════════════════════════════════════
ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings  ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (guest users)
CREATE POLICY "Allow anon all on chat_sessions"
  ON chat_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on chat_messages"
  ON chat_messages FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on daily_usage"
  ON daily_usage FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on user_settings"
  ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════
-- 7. SAMPLE DATA (optional — for testing)
-- ══════════════════════════════════════════════════════════
-- INSERT INTO chat_sessions (title, cad_software, user_id)
-- VALUES ('Test SolidWorks Chat', 'solidworks', 'guest-test-123');
