-- =============================================
-- Supabase Database Schema (Simplified - No RLS)
-- はじめて.AI - AI Library
-- RLSを使わないシンプルなバージョン
-- =============================================

-- 2. プロンプトマスターテーブル
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  use_case TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- 3. ユーザーのお気に入りテーブル
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt_id ON user_favorites(prompt_id);

-- RLSを無効化
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;

-- 4. カスタムプロンプトテーブル
CREATE TABLE IF NOT EXISTS custom_prompts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_prompts_user_id ON custom_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_prompts_category ON custom_prompts(category);
CREATE INDEX IF NOT EXISTS idx_custom_prompts_created_at ON custom_prompts(created_at DESC);

-- RLSを無効化
ALTER TABLE custom_prompts DISABLE ROW LEVEL SECURITY;

-- 5. フォルダテーブル
CREATE TABLE IF NOT EXISTS user_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prompt_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_folders_user_id ON user_folders(user_id);

-- RLSを無効化
ALTER TABLE user_folders DISABLE ROW LEVEL SECURITY;

-- 6. 記事テーブル
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- RLSを無効化
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;

-- 7. プロンプトコピーログテーブル
CREATE TABLE IF NOT EXISTS copy_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copy_logs_user_id ON copy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_logs_prompt_id ON copy_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_copy_logs_created_at ON copy_logs(created_at DESC);

-- RLSを無効化
ALTER TABLE copy_logs DISABLE ROW LEVEL SECURITY;

-- 8. 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- RLSを無効化
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;

-- プロンプトマスターテーブルもRLS無効化（全員が閲覧可能）
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 注意事項
-- =============================================
-- 1. このSQLをSupabaseのSQL Editorで実行してください
-- 2. RLSは無効化されているため、フロントエンドで user_id によるフィルタリングを行ってください
-- 3. VITE_SUPABASE_ANON_KEY を使用してクライアントから直接アクセスします
-- 4. セキュリティを高めたい場合は、後でRLSを有効化して適切なポリシーを設定してください
