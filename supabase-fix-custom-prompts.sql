-- custom_promptsテーブルにis_publicカラムを追加（存在しない場合）
ALTER TABLE custom_prompts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- スキーマキャッシュをリフレッシュするため、コメントを追加
COMMENT ON TABLE custom_prompts IS 'User custom prompts with public sharing option';
