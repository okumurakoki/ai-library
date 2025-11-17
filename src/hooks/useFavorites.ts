import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'ai-library-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // localStorageから お気に入りを読み込む
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  // お気に入りをlocalStorageに保存
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  // お気に入りに追加
  const addFavorite = (promptId: string) => {
    if (!favorites.includes(promptId)) {
      saveFavorites([...favorites, promptId]);
    }
  };

  // お気に入りから削除
  const removeFavorite = (promptId: string) => {
    saveFavorites(favorites.filter((id) => id !== promptId));
  };

  // お気に入りのトグル
  const toggleFavorite = (promptId: string) => {
    if (favorites.includes(promptId)) {
      removeFavorite(promptId);
    } else {
      addFavorite(promptId);
    }
  };

  // お気に入りかどうかをチェック
  const isFavorite = (promptId: string) => {
    return favorites.includes(promptId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
