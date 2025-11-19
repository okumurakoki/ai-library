import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  fetchUserFolders,
  createFolder as createFolderInSupabase,
  updateFolder as updateFolderInSupabase,
  deleteFolder as deleteFolderFromSupabase,
} from '../lib/supabase';
import type { FavoriteFolder } from '../types';

const FOLDERS_KEY = 'ai-library-folders';

export const useFolders = () => {
  const { user } = useUser();
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // フォルダを読み込む
  useEffect(() => {
    const loadFolders = async () => {
      setLoading(true);

      if (user) {
        // ログインユーザー：Supabaseから取得
        try {
          const supabaseFolders = await fetchUserFolders(user.id);
          setFolders(supabaseFolders);

          // localStorageのデータをSupabaseに移行（初回のみ）
          const stored = localStorage.getItem(FOLDERS_KEY);
          if (stored) {
            try {
              const localFolders = JSON.parse(stored);
              // ローカルにあってSupabaseにないものを移行
              const existingIds = new Set(supabaseFolders.map((f: any) => f.id));
              const toMigrate = localFolders.filter(
                (f: FavoriteFolder) => !existingIds.has(f.id)
              );

              for (const folder of toMigrate) {
                await createFolderInSupabase(user.id, {
                  id: folder.id,
                  name: folder.name,
                  prompt_ids: folder.promptIds,
                });
              }

              if (toMigrate.length > 0) {
                // 移行後、再取得
                const updated = await fetchUserFolders(user.id);
                setFolders(updated);
              }

              // 移行完了後、localStorageをクリア
              localStorage.removeItem(FOLDERS_KEY);
            } catch (error) {
              console.error('Error migrating folders:', error);
            }
          }
        } catch (error) {
          console.error('Error loading folders from Supabase:', error);
        }
      } else {
        // 非ログインユーザー：localStorageから取得
        const stored = localStorage.getItem(FOLDERS_KEY);
        if (stored) {
          try {
            setFolders(JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing folders:', error);
            setFolders([]);
          }
        }
      }

      setLoading(false);
    };

    loadFolders();
  }, [user]);

  // localStorageに保存（非ログインユーザー用）
  const saveToLocal = (updatedFolders: FavoriteFolder[]) => {
    setFolders(updatedFolders);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(updatedFolders));
  };

  // フォルダを追加
  const addFolder = async (folder: FavoriteFolder) => {
    if (user) {
      // ログインユーザー：Supabaseに保存
      const created = await createFolderInSupabase(user.id, {
        id: folder.id,
        name: folder.name,
        prompt_ids: folder.promptIds,
      });

      if (created) {
        // prompt_idsをpromptIdsに変換
        const folderWithCorrectKeys = {
          ...created,
          promptIds: created.prompt_ids,
        };
        setFolders([...folders, folderWithCorrectKeys]);
      }
    } else {
      // 非ログインユーザー：localStorageに保存
      saveToLocal([...folders, folder]);
    }
  };

  // フォルダを更新
  const updateFolder = async (folderId: string, updates: Partial<FavoriteFolder>) => {
    if (user) {
      // ログインユーザー：Supabaseで更新
      const updated = await updateFolderInSupabase(folderId, {
        name: updates.name,
        prompt_ids: updates.promptIds,
      });

      if (updated) {
        const folderWithCorrectKeys = {
          ...updated,
          promptIds: updated.prompt_ids,
        };
        setFolders(
          folders.map((f) => (f.id === folderId ? { ...f, ...folderWithCorrectKeys } : f))
        );
      }
    } else {
      // 非ログインユーザー：localStorageで更新
      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, ...updates } : f
      );
      saveToLocal(updatedFolders);
    }
  };

  // フォルダを削除
  const deleteFolder = async (folderId: string) => {
    if (user) {
      // ログインユーザー：Supabaseから削除
      const success = await deleteFolderFromSupabase(folderId);
      if (success) {
        setFolders(folders.filter((f) => f.id !== folderId));
      }
    } else {
      // 非ログインユーザー：localStorageから削除
      saveToLocal(folders.filter((f) => f.id !== folderId));
    }
  };

  return {
    folders,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
  };
};
