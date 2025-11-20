-- プロンプトテーブルにplan_typeカラムを追加
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'standard', 'premium'));

-- 既存のis_premiumからplan_typeへデータ移行
UPDATE public.prompts
SET plan_type = CASE
  WHEN is_premium = true THEN 'premium'
  ELSE 'free'
END
WHERE plan_type IS NULL OR plan_type = 'free';

-- plan_typeにインデックスを追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_prompts_plan_type ON public.prompts(plan_type);
