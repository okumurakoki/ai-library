/**
 * Supabaseから取得したプロンプトデータをフロントエンド形式に変換
 */
export const convertPromptFromSupabase = (data: any) => {
  return {
    ...data,
    useCase: data.use_case || [],
    isPremium: data.is_premium || false,
    planType: data.plan_type || (data.is_premium ? 'premium' : 'free'),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Supabaseから取得した記事データをフロントエンド形式に変換
 */
export const convertArticleFromSupabase = (data: any) => {
  return {
    ...data,
    isPublished: data.is_published,
    publishedAt: data.published_at,
    thumbnailUrl: data.thumbnail_url,
  };
};

/**
 * Supabaseから取得したフォルダデータをフロントエンド形式に変換
 */
export const convertFolderFromSupabase = (data: any) => {
  return {
    ...data,
    promptIds: data.prompt_ids || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * フロントエンド形式のプロンプトデータをSupabase形式に変換
 */
export const convertPromptToSupabase = (data: any) => {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    use_case: data.useCase || [],
    tags: data.tags || [],
    usage: data.usage,
    example: data.example,
    is_premium: data.isPremium || false,
    plan_type: data.planType || 'free',
  };
};

/**
 * フロントエンド形式の記事データをSupabase形式に変換
 */
export const convertArticleToSupabase = (data: any) => {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    category: data.category,
    tags: data.tags || [],
    author: data.author,
    thumbnail_url: data.thumbnailUrl,
    is_published: data.isPublished || false,
    published_at: data.publishedAt,
  };
};

/**
 * フロントエンド形式のフォルダデータをSupabase形式に変換
 */
export const convertFolderToSupabase = (data: any) => {
  return {
    id: data.id,
    user_id: data.userId,
    name: data.name,
    prompt_ids: data.promptIds || [],
  };
};
