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

// =============================================
// お気に入り機能
// =============================================

// お気に入りを取得
export const fetchUserFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('prompt_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }

  return data.map(f => f.prompt_id);
};

// お気に入りに追加
export const addFavorite = async (userId: string, promptId: string) => {
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, prompt_id: promptId });

  if (error) {
    console.error('Error adding favorite:', error);
    return false;
  }

  return true;
};

// お気に入りから削除
export const removeFavorite = async (userId: string, promptId: string) => {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', promptId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
};

// =============================================
// カスタムプロンプト機能
// =============================================

// カスタムプロンプトを取得
export const fetchCustomPrompts = async (userId: string) => {
  const { data, error } = await supabase
    .from('custom_prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching custom prompts:', error);
    return [];
  }

  return data;
};

// カスタムプロンプトを作成
export const createCustomPrompt = async (
  userId: string,
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags?: string[];
    is_public?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('custom_prompts')
    .insert({
      id: prompt.id,
      user_id: userId,
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags || [],
      is_public: prompt.is_public || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating custom prompt:', error);
    return null;
  }

  return data;
};

// カスタムプロンプトを更新
export const updateCustomPrompt = async (
  promptId: string,
  updates: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    is_public?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('custom_prompts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', promptId)
    .select()
    .single();

  if (error) {
    console.error('Error updating custom prompt:', error);
    return null;
  }

  return data;
};

// カスタムプロンプトを削除
export const deleteCustomPrompt = async (promptId: string) => {
  const { error } = await supabase
    .from('custom_prompts')
    .delete()
    .eq('id', promptId);

  if (error) {
    console.error('Error deleting custom prompt:', error);
    return false;
  }

  return true;
};

// =============================================
// フォルダ機能
// =============================================

// フォルダを取得
export const fetchUserFolders = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_folders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  return data;
};

// フォルダを作成
export const createFolder = async (
  userId: string,
  folder: {
    id: string;
    name: string;
    prompt_ids?: string[];
  }
) => {
  const { data, error } = await supabase
    .from('user_folders')
    .insert({
      id: folder.id,
      user_id: userId,
      name: folder.name,
      prompt_ids: folder.prompt_ids || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    return null;
  }

  return data;
};

// フォルダを更新
export const updateFolder = async (
  folderId: string,
  updates: {
    name?: string;
    prompt_ids?: string[];
  }
) => {
  const { data, error } = await supabase
    .from('user_folders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', folderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder:', error);
    return null;
  }

  return data;
};

// フォルダを削除
export const deleteFolder = async (folderId: string) => {
  const { error } = await supabase
    .from('user_folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder:', error);
    return false;
  }

  return true;
};
