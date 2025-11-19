-- custom_promptsテーブルにuse_caseカラムを追加
ALTER TABLE custom_prompts ADD COLUMN IF NOT EXISTS use_case TEXT[] DEFAULT '{}';

-- コメントを追加してスキーマキャッシュをリフレッシュ
COMMENT ON COLUMN custom_prompts.use_case IS 'Use case categories for the prompt';
