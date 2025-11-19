import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  fetchUserFavorites,
  addFavorite as addFavoriteToSupabase,
  removeFavorite as removeFavoriteFromSupabase,
} from '../lib/supabase';

const FAVORITES_KEY = 'ai-library-favorites';

export const useFavorites = () => {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // お気に入りを読み込む（ユーザーがいればSupabase、いなければlocalStorage）
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);

      if (user) {
        // ログインユーザー：Supabaseから取得
        try {
          const supabaseFavorites = await fetchUserFavorites(user.id);
          setFavorites(supabaseFavorites);

          // localStorageのデータをSupabaseに移行（初回のみ）
          const stored = localStorage.getItem(FAVORITES_KEY);
          if (stored) {
            try {
              const localFavorites = JSON.parse(stored);
              // ローカルにあってSupabaseにないものを移行
              const toMigrate = localFavorites.filter(
                (id: string) => !supabaseFavorites.includes(id)
              );
              for (const promptId of toMigrate) {
                await addFavoriteToSupabase(user.id, promptId);
              }
              if (toMigrate.length > 0) {
                // 移行後、再取得
                const updated = await fetchUserFavorites(user.id);
                setFavorites(updated);
              }
              // 移行完了後、localStorageをクリア
              localStorage.removeItem(FAVORITES_KEY);
            } catch (error) {
              console.error('Error migrating favorites:', error);
            }
          }
        } catch (error) {
          console.error('Error loading favorites from Supabase:', error);
        }
      } else {
        // 非ログインユーザー：localStorageから取得
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) {
          try {
            setFavorites(JSON.parse(stored));
          } catch (error) {
            console.error('Error parsing favorites:', error);
            setFavorites([]);
          }
        }
      }

      setLoading(false);
    };

    loadFavorites();
  }, [user]);

  // お気に入りをlocalStorageに保存（非ログインユーザー用）
  const saveFavoritesToLocal = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  // お気に入りに追加
  const addFavorite = async (promptId: string) => {
    if (favorites.includes(promptId)) return;

    if (user) {
      // ログインユーザー：Supabaseに保存
      const success = await addFavoriteToSupabase(user.id, promptId);
      if (success) {
        setFavorites([...favorites, promptId]);
      }
    } else {
      // 非ログインユーザー：localStorageに保存
      saveFavoritesToLocal([...favorites, promptId]);
    }
  };

  // お気に入りから削除
  const removeFavorite = async (promptId: string) => {
    if (user) {
      // ログインユーザー：Supabaseから削除
      const success = await removeFavoriteFromSupabase(user.id, promptId);
      if (success) {
        setFavorites(favorites.filter((id) => id !== promptId));
      }
    } else {
      // 非ログインユーザー：localStorageから削除
      saveFavoritesToLocal(favorites.filter((id) => id !== promptId));
    }
  };

  // お気に入りのトグル
  const toggleFavorite = async (promptId: string) => {
    if (favorites.includes(promptId)) {
      await removeFavorite(promptId);
    } else {
      await addFavorite(promptId);
    }
  };

  // お気に入りかどうかをチェック
  const isFavorite = (promptId: string) => {
    return favorites.includes(promptId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
