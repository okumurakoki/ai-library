import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabaseからプロンプトを取得
export const fetchPrompts = async () => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }

  return data;
};

// Supabaseから記事を取得
export const fetchArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data;
};

// ユーザーのサブスクリプション情報を取得
export const fetchUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
};

// プロンプトのコピーログを記録
export const logPromptCopy = async (userId: string, promptId: string) => {
  const { error } = await supabase
    .from('copy_logs')
    .insert({ user_id: userId, prompt_id: promptId });

  if (error) {
    console.error('Error logging copy:', error);
  }
};
