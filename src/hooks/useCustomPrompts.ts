import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  fetchCustomPrompts,
  createCustomPrompt as createCustomPromptInSupabase,
  updateCustomPrompt as updateCustomPromptInSupabase,
  deleteCustomPrompt as deleteCustomPromptFromSupabase,
} from '../lib/supabase';
import type { Prompt } from '../types';

const CUSTOM_PROMPTS_KEY = 'ai-library-custom-prompts';

export const useCustomPrompts = () => {
  const { user } = useUser();
  const [customPrompts, setCustomPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // カスタムプロンプトを読み込む
  useEffect(() => {
    const loadCustomPrompts = async () => {
      setLoading(true);

      if (user) {
        // ログインユーザー：Supabaseから取得
        try {
          const supabasePrompts = await fetchCustomPrompts(user.id);
          // Supabaseの形式をフロントエンドの形式に変換
          const promptsForDisplay: Prompt[] = supabasePrompts.map((p: any) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            category: p.category,
            tags: Array.isArray(p.tags) ? p.tags : [],
            useCase: Array.isArray(p.use_case) ? p.use_case : [],
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setCustomPrompts(promptsForDisplay);

          // localStorageのデータをSupabaseに移行（初回のみ）
          const stored = localStorage.getItem(CUSTOM_PROMPTS_KEY);
          if (stored) {
            try {
              const localPrompts = JSON.parse(stored);
              // ローカルにあってSupabaseにないものを移行
              const existingIds = new Set(supabasePrompts.map((p: any) => p.id));
              const toMigrate = localPrompts.filter(
                (p: Prompt) => !existingIds.has(p.id)
              );

              for (const prompt of toMigrate) {
                await createCustomPromptInSupabase(user.id, {
                  id: prompt.id,
                  title: prompt.title,
                  content: prompt.content,
                  category: prompt.category,
                  tags: prompt.tags,
                  use_case: prompt.useCase || [],
                  is_public: false,
                });
              }

              if (toMigrate.length > 0) {
                // 移行後、再取得
                const updated = await fetchCustomPrompts(user.id);
                const updatedForDisplay: Prompt[] = updated.map((p: any) => ({
                  id: p.id,
                  title: p.title,
                  content: p.content,
                  category: p.category,
                  tags: Array.isArray(p.tags) ? p.tags : [],
                  useCase: Array.isArray(p.use_case) ? p.use_case : [],
                  createdAt: p.created_at,
                  updatedAt: p.updated_at,
                }));
                setCustomPrompts(updatedForDisplay);
              }

              // 移行完了後、localStorageをクリア
              localStorage.removeItem(CUSTOM_PROMPTS_KEY);
            } catch (error) {
              console.error('Error migrating custom prompts:', error);
            }
          }
        } catch (error) {
          console.error('Error loading custom prompts from Supabase:', error);
        }
      } else {
        // 非ログインユーザー：localStorageから取得
        const stored = localStorage.getItem(CUSTOM_PROMPTS_KEY);
        if (stored) {
          try {
            setCustomPrompts(JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing custom prompts:', error);
            setCustomPrompts([]);
          }
        }
      }

      setLoading(false);
    };

    loadCustomPrompts();
  }, [user]);

  // localStorageに保存（非ログインユーザー用）
  const saveToLocal = (prompts: Prompt[]) => {
    setCustomPrompts(prompts);
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(prompts));
  };

  // カスタムプロンプトを追加
  const addCustomPrompt = async (prompt: Prompt) => {
    if (user) {
      // ログインユーザー：Supabaseに保存
      const created = await createCustomPromptInSupabase(user.id, {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
        use_case: prompt.useCase || [],
        is_public: false,
      });

      if (created) {
        // Supabaseの形式をフロントエンドの形式に変換
        const promptForDisplay: Prompt = {
          id: created.id,
          title: created.title,
          content: created.content,
          category: created.category,
          tags: Array.isArray(created.tags) ? created.tags : [],
          useCase: Array.isArray(created.use_case) ? created.use_case : [],
          createdAt: created.created_at,
          updatedAt: created.updated_at,
        };
        setCustomPrompts([...customPrompts, promptForDisplay]);
      }
    } else {
      // 非ログインユーザー：localStorageに保存
      saveToLocal([...customPrompts, prompt]);
    }
  };

  // カスタムプロンプトを更新
  const updateCustomPrompt = async (promptId: string, updates: Partial<Prompt>) => {
    if (user) {
      // ログインユーザー：Supabaseで更新
      // camelCaseをsnake_caseに変換
      const supabaseUpdates: any = {};
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.content !== undefined) supabaseUpdates.content = updates.content;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
      if (updates.useCase !== undefined) supabaseUpdates.use_case = updates.useCase;

      const updated = await updateCustomPromptInSupabase(promptId, supabaseUpdates);
      if (updated) {
        // Supabaseの形式をフロントエンドの形式に変換
        const promptForDisplay: Prompt = {
          id: updated.id,
          title: updated.title,
          content: updated.content,
          category: updated.category,
          tags: Array.isArray(updated.tags) ? updated.tags : [],
          useCase: Array.isArray(updated.use_case) ? updated.use_case : [],
          createdAt: updated.created_at,
          updatedAt: updated.updated_at,
        };
        setCustomPrompts(
          customPrompts.map((p) => (p.id === promptId ? promptForDisplay : p))
        );
      }
    } else {
      // 非ログインユーザー：localStorageで更新
      const updated = customPrompts.map((p) =>
        p.id === promptId ? { ...p, ...updates } : p
      );
      saveToLocal(updated);
    }
  };

  // カスタムプロンプトを削除
  const deleteCustomPrompt = async (promptId: string) => {
    if (user) {
      // ログインユーザー：Supabaseから削除
      const success = await deleteCustomPromptFromSupabase(promptId);
      if (success) {
        setCustomPrompts(customPrompts.filter((p) => p.id !== promptId));
      }
    } else {
      // 非ログインユーザー：localStorageから削除
      saveToLocal(customPrompts.filter((p) => p.id !== promptId));
    }
  };

  return {
    customPrompts,
    loading,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
  };
};
