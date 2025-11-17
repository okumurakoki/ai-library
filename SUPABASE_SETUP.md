# Supabaseデータベースセットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスし、アカウントを作成
2. 新しいプロジェクトを作成
   - Project Name: `ai-library`
   - Database Password: 安全なパスワードを設定
   - Region: `Tokyo (ap-northeast-1)` を選択
3. プロジェクトの作成完了を待つ

## 2. 環境変数の取得

プロジェクト設定から以下の情報を取得:

- **Project URL**: `Settings > API > Project URL`
- **anon/public key**: `Settings > API > Project API keys > anon/public`

これらを `.env` ファイルに設定:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. データベーステーブルの作成

Supabase Dashboard の `SQL Editor` で以下のSQLを実行してください。

### 3.1 promptsテーブル

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  usage TEXT,
  example TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
```

### 3.2 articlesテーブル

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('news', 'tips')),
  author TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
```

### 3.3 user_profilesテーブル

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);
```

### 3.4 user_subscriptionsテーブル

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
```

### 3.5 user_favoritesテーブル

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
```

### 3.6 copy_logsテーブル

```sql
CREATE TABLE copy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  copied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_copy_logs_user_id ON copy_logs(user_id, copied_at DESC);
CREATE INDEX idx_copy_logs_prompt_id ON copy_logs(prompt_id, copied_at DESC);
```

## 4. Row Level Security (RLS) ポリシーの設定

```sql
-- promptsテーブル
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開プロンプトは全員が閲覧可能" ON prompts
  FOR SELECT USING (true);

-- articlesテーブル
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開記事は全員が閲覧可能" ON articles
  FOR SELECT USING (is_published = true);

-- user_favoritesテーブル
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のお気に入りのみ操作可能" ON user_favorites
  FOR ALL USING (true);
```

## 5. 完了

これでSupabaseのセットアップは完了です。
