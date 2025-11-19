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

// =============================================
// 記事機能
// =============================================

// 公開記事を取得
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

// 全記事を取得（管理者用）
export const fetchAllArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }

  return data;
};

// 記事を作成
export const createArticle = async (article: {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  author?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  published_at?: string;
}) => {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    return null;
  }

  return data;
};

// 記事を更新
export const updateArticle = async (
  articleId: string,
  updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    author?: string;
    thumbnail_url?: string;
    is_published?: boolean;
    published_at?: string;
  }
) => {
  const { data, error } = await supabase
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', articleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    return null;
  }

  return data;
};

// 記事を削除
export const deleteArticle = async (articleId: string) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (error) {
    console.error('Error deleting article:', error);
    return false;
  }

  return true;
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
// 統計機能
// =============================================

// プロンプトコピー数を取得（期間指定可能）
export const getPromptCopyStats = async (startDate?: Date, endDate?: Date) => {
  let query = supabase
    .from('copy_logs')
    .select('prompt_id, created_at');

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching copy stats:', error);
    return [];
  }

  return data;
};

// 人気プロンプトランキングを取得
export const getPopularPrompts = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('copy_logs')
    .select('prompt_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching popular prompts:', error);
    return [];
  }

  // プロンプトIDごとにカウント
  const counts: { [key: string]: number } = {};
  data.forEach((log: any) => {
    counts[log.prompt_id] = (counts[log.prompt_id] || 0) + 1;
  });

  // ソートして上位を返す
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([promptId, count]) => ({ promptId, count }));
};

// ユーザーのアクティビティを取得
export const getUserActivity = async (userId: string) => {
  // お気に入り数
  const { data: favorites, error: favError } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', userId);

  // カスタムプロンプト数
  const { data: customPrompts, error: customError } = await supabase
    .from('custom_prompts')
    .select('id')
    .eq('user_id', userId);

  // コピー数
  const { data: copies, error: copyError } = await supabase
    .from('copy_logs')
    .select('id')
    .eq('user_id', userId);

  if (favError || customError || copyError) {
    console.error('Error fetching user activity');
    return { favorites: 0, customPrompts: 0, copies: 0 };
  }

  return {
    favorites: favorites?.length || 0,
    customPrompts: customPrompts?.length || 0,
    copies: copies?.length || 0,
  };
};

// 全体統計を取得
export const getOverallStats = async () => {
  // ユニークユーザー数（お気に入りを持っているユーザー）
  const { data: uniqueUsers } = await supabase
    .from('user_favorites')
    .select('user_id');

  const activeUsers = uniqueUsers
    ? new Set(uniqueUsers.map((u: any) => u.user_id)).size
    : 0;

  // 総コピー数
  const { count: totalCopies } = await supabase
    .from('copy_logs')
    .select('*', { count: 'exact', head: true });

  // 総記事数
  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  // 総カスタムプロンプト数
  const { count: totalCustomPrompts } = await supabase
    .from('custom_prompts')
    .select('*', { count: 'exact', head: true });

  return {
    activeUsers,
    totalCopies: totalCopies || 0,
    totalArticles: totalArticles || 0,
    totalCustomPrompts: totalCustomPrompts || 0,
  };
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
    use_case?: string[];
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
      use_case: prompt.use_case || [],
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
    use_case?: string[];
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
