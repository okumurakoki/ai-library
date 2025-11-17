import { useState, useEffect } from 'react';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  count: number;
}

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // LocalStorageから履歴を読み込み
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const history: SearchHistoryItem[] = JSON.parse(data);
        // 最新順にソート
        history.sort((a, b) => b.timestamp - a.timestamp);
        setSearchHistory(history);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // 検索を記録
  const recordSearch = (query: string) => {
    if (!query.trim()) return;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const history: SearchHistoryItem[] = data ? JSON.parse(data) : [];

      // 既存の検索クエリを探す
      const existingIndex = history.findIndex((item) => item.query.toLowerCase() === query.toLowerCase());

      if (existingIndex >= 0) {
        // 既存の記録を更新
        history[existingIndex].timestamp = Date.now();
        history[existingIndex].count += 1;
      } else {
        // 新規記録を追加
        history.push({
          query: query.trim(),
          timestamp: Date.now(),
          count: 1,
        });
      }

      // 最新順にソート
      history.sort((a, b) => b.timestamp - a.timestamp);

      // 最大件数を超えた場合は古いものを削除
      const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
      setSearchHistory(trimmedHistory);
    } catch (error) {
      console.error('Failed to record search:', error);
    }
  };

  // 検索履歴を削除
  const deleteSearchHistoryItem = (query: string) => {
    try {
      const filteredHistory = searchHistory.filter((item) => item.query !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
      setSearchHistory(filteredHistory);
    } catch (error) {
      console.error('Failed to delete search history item:', error);
    }
  };

  // 全検索履歴をクリア
  const clearSearchHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // 最近の検索（最新5件）
  const recentSearches = searchHistory.slice(0, 5);

  // 人気の検索（使用回数順、上位5件）
  const popularSearches = [...searchHistory]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    searchHistory,
    recentSearches,
    popularSearches,
    recordSearch,
    deleteSearchHistoryItem,
    clearSearchHistory,
  };
};
