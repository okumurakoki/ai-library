-- custom_promptsテーブルのid列の型をTEXTに変更
ALTER TABLE custom_prompts ALTER COLUMN id TYPE TEXT;

-- 念のため、他のテーブルも確認してTEXTに変更
ALTER TABLE user_folders ALTER COLUMN id TYPE TEXT;
ALTER TABLE articles ALTER COLUMN id TYPE TEXT;
ALTER TABLE prompts ALTER COLUMN id TYPE TEXT;
