import { useState, useEffect } from 'react';

interface PromptHistoryItem {
  promptId: string;
  timestamp: number;
  count: number;
}

interface PromptStats {
  totalCopies: number;
  todayCopies: number;
  thisMonthCopies: number;
  mostUsedPrompts: { promptId: string; count: number }[];
  recentPrompts: string[]; // 最近使ったプロンプトID（順番保持）
}

const STORAGE_KEY = 'prompt_history';
const MAX_RECENT_PROMPTS = 10;

export const usePromptHistory = () => {
  const [stats, setStats] = useState<PromptStats>({
    totalCopies: 0,
    todayCopies: 0,
    thisMonthCopies: 0,
    mostUsedPrompts: [],
    recentPrompts: [],
  });

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const loadHistory = () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return;

        const history: PromptHistoryItem[] = JSON.parse(data);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        // 統計を計算
        const totalCopies = history.reduce((sum, item) => sum + item.count, 0);
        const todayCopies = history
          .filter(item => item.timestamp >= todayStart)
          .reduce((sum, item) => sum + item.count, 0);
        const thisMonthCopies = history
          .filter(item => item.timestamp >= monthStart)
          .reduce((sum, item) => sum + item.count, 0);

        // 使用頻度順にソート
        const promptCounts = new Map<string, number>();
        history.forEach(item => {
          promptCounts.set(item.promptId, (promptCounts.get(item.promptId) || 0) + item.count);
        });
        const mostUsedPrompts = Array.from(promptCounts.entries())
          .map(([promptId, count]) => ({ promptId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // 最近使った順（タイムスタンプ順、重複なし）
        const recentPrompts = Array.from(
          new Map(
            history
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(item => [item.promptId, item])
          ).values()
        )
          .slice(0, MAX_RECENT_PROMPTS)
          .map(item => item.promptId);

        setStats({
          totalCopies,
          todayCopies,
          thisMonthCopies,
          mostUsedPrompts,
          recentPrompts,
        });
      } catch (error) {
        console.error('Failed to load prompt history:', error);
      }
    };

    loadHistory();
  }, []);

  // プロンプト使用を記録
  const recordPromptUse = (promptId: string) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const history: PromptHistoryItem[] = data ? JSON.parse(data) : [];

      // 今日の同じプロンプトの記録を探す
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingIndex = history.findIndex(
        item => item.promptId === promptId && item.timestamp >= todayStart.getTime()
      );

      if (existingIndex >= 0) {
        // 既存の記録をカウントアップ
        history[existingIndex].count += 1;
        history[existingIndex].timestamp = now;
      } else {
        // 新規記録を追加
        history.push({
          promptId,
          timestamp: now,
          count: 1,
        });
      }

      // 古いデータを削除（3ヶ月以上前）
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      const filteredHistory = history.filter(item => item.timestamp >= threeMonthsAgo);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));

      // 統計を再計算
      const todayStart2 = new Date();
      todayStart2.setHours(0, 0, 0, 0);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const totalCopies = filteredHistory.reduce((sum, item) => sum + item.count, 0);
      const todayCopies = filteredHistory
        .filter(item => item.timestamp >= todayStart2.getTime())
        .reduce((sum, item) => sum + item.count, 0);
      const thisMonthCopies = filteredHistory
        .filter(item => item.timestamp >= monthStart.getTime())
        .reduce((sum, item) => sum + item.count, 0);

      const promptCounts = new Map<string, number>();
      filteredHistory.forEach(item => {
        promptCounts.set(item.promptId, (promptCounts.get(item.promptId) || 0) + item.count);
      });
      const mostUsedPrompts = Array.from(promptCounts.entries())
        .map(([id, count]) => ({ promptId: id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const recentPrompts = Array.from(
        new Map(
          filteredHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(item => [item.promptId, item])
        ).values()
      )
        .slice(0, MAX_RECENT_PROMPTS)
        .map(item => item.promptId);

      setStats({
        totalCopies,
        todayCopies,
        thisMonthCopies,
        mostUsedPrompts,
        recentPrompts,
      });
    } catch (error) {
      console.error('Failed to record prompt use:', error);
    }
  };

  // 全履歴データを取得
  const getAllHistory = (): PromptHistoryItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  };

  // 日別の集計データを取得
  const getDailyStats = (days: number = 30) => {
    const history = getAllHistory();
    const now = new Date();
    const dailyData: { date: string; copies: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayCopies = history
        .filter(item => item.timestamp >= dayStart && item.timestamp < dayEnd)
        .reduce((sum, item) => sum + item.count, 0);

      dailyData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        copies: dayCopies,
      });
    }

    return dailyData;
  };

  return {
    stats,
    recordPromptUse,
    getAllHistory,
    getDailyStats,
  };
};
