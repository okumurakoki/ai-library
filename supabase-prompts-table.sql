-- プロンプトテーブル作成
create table if not exists public.prompts (
  id text primary key,
  title text not null,
  content text not null,
  category text not null,
  use_case text[] default '{}',
  tags text[] default '{}',
  usage text,
  example text,
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS有効化
alter table public.prompts enable row level security;

-- 誰でも読み取り可能
create policy "Allow public read access"
  on public.prompts
  for select
  using (true);

-- 管理者のみ挿入・更新・削除可能（後で実装）
create policy "Allow admin insert"
  on public.prompts
  for insert
  with check (true);

create policy "Allow admin update"
  on public.prompts
  for update
  using (true);

create policy "Allow admin delete"
  on public.prompts
  for delete
  using (true);
