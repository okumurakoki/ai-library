-- =============================================
-- Supabase Database Schema
-- はじめて.AI - AI Library
-- =============================================

-- 1. user_subscriptions テーブル（既存）
-- 既に作成済みなので、参考として記載
-- CREATE TABLE user_subscriptions (
--   id BIGSERIAL PRIMARY KEY,
--   user_id TEXT NOT NULL,
--   stripe_customer_id TEXT,
--   stripe_subscription_id TEXT,
--   plan_type TEXT,
--   status TEXT,
--   current_period_start TIMESTAMPTZ,
--   current_period_end TIMESTAMPTZ,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

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

-- プロンプトマスターのインデックス
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

-- お気に入りのインデックス
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_prompt_id ON user_favorites(prompt_id);

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

-- カスタムプロンプトのインデックス
CREATE INDEX IF NOT EXISTS idx_custom_prompts_user_id ON custom_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_prompts_category ON custom_prompts(category);
CREATE INDEX IF NOT EXISTS idx_custom_prompts_created_at ON custom_prompts(created_at DESC);

-- 5. フォルダテーブル
CREATE TABLE IF NOT EXISTS user_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  prompt_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- フォルダのインデックス
CREATE INDEX IF NOT EXISTS idx_user_folders_user_id ON user_folders(user_id);

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

-- 記事のインデックス
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- 7. プロンプトコピーログテーブル
CREATE TABLE IF NOT EXISTS copy_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- コピーログのインデックス
CREATE INDEX IF NOT EXISTS idx_copy_logs_user_id ON copy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_logs_prompt_id ON copy_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_copy_logs_created_at ON copy_logs(created_at DESC);

-- 8. 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 検索履歴のインデックス
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- user_favorites のRLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid()::text = user_id);

-- custom_prompts のRLS
ALTER TABLE custom_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom prompts"
  ON custom_prompts FOR SELECT
  USING (auth.uid()::text = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own custom prompts"
  ON custom_prompts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own custom prompts"
  ON custom_prompts FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own custom prompts"
  ON custom_prompts FOR DELETE
  USING (auth.uid()::text = user_id);

-- user_folders のRLS
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders"
  ON user_folders FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own folders"
  ON user_folders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own folders"
  ON user_folders FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own folders"
  ON user_folders FOR DELETE
  USING (auth.uid()::text = user_id);

-- prompts は全員が閲覧可能（マスターデータ）
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompts"
  ON prompts FOR SELECT
  TO PUBLIC
  USING (TRUE);

-- articles は公開されているものだけ閲覧可能
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (is_published = TRUE);

-- copy_logs のRLS
ALTER TABLE copy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own copy logs"
  ON copy_logs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own copy logs"
  ON copy_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- search_history のRLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own search history"
  ON search_history FOR DELETE
  USING (auth.uid()::text = user_id);

-- =============================================
-- 注意事項
-- =============================================
-- 1. このSQLをSupabaseのSQL Editorで実行してください
-- 2. RLSポリシーはClerk認証と統合する場合、調整が必要です
--    現在は auth.uid() を使っていますが、Clerkの場合は
--    別の方法でuser_idを検証する必要があるかもしれません
-- 3. user_subscriptions テーブルは既にRLSを無効化しているので
--    そのまま維持してください（service_roleキーで操作するため）
