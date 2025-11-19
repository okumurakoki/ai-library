import { useMemo } from 'react';
import type { Prompt } from '../types';
import { usePromptHistory } from './usePromptHistory';

interface RecommendationScore {
  promptId: string;
  score: number;
  reasons: string[];
}

export const useRecommendations = (
  allPrompts: Prompt[],
  favorites: string[],
  count: number = 6
) => {
  const { stats } = usePromptHistory();

  const recommendedPrompts = useMemo(() => {
    // スコアリング用のMap
    const scores = new Map<string, RecommendationScore>();

    // 使用履歴のあるプロンプトを取得
    const usedPromptIds = new Set(stats.mostUsedPrompts.map(item => item.promptId));
    const usedPrompts = allPrompts.filter(p => usedPromptIds.has(p.id));

    // お気に入りのプロンプトを取得
    const favoritePrompts = allPrompts.filter(p => favorites.includes(p.id));

    // 対象プロンプト（使用履歴 + お気に入り）
    const basePrompts = [...new Set([...usedPrompts, ...favoritePrompts])];

    // ベースとなるプロンプトがない場合は人気順で返す
    if (basePrompts.length === 0) {
      return allPrompts
        .slice(0, count)
        .map(p => ({ prompt: p, reasons: ['新着プロンプト'] }));
    }

    // カテゴリの集計
    const categoryCount = new Map<string, number>();
    basePrompts.forEach(p => {
      categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
    });

    // タグの集計
    const tagCount = new Map<string, number>();
    basePrompts.forEach(p => {
      if (p.tags) {
        p.tags.forEach(tag => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      }
    });

    // 用途の集計
    const useCaseCount = new Map<string, number>();
    basePrompts.forEach(p => {
      p.useCase?.forEach(uc => {
        useCaseCount.set(uc, (useCaseCount.get(uc) || 0) + 1);
      });
    });

    // 各プロンプトをスコアリング
    allPrompts.forEach(prompt => {
      // すでに使用済み or お気に入りは除外
      if (usedPromptIds.has(prompt.id) || favorites.includes(prompt.id)) {
        return;
      }

      let score = 0;
      const reasons: string[] = [];

      // 1. カテゴリマッチング（最大30点）
      const categoryScore = categoryCount.get(prompt.category) || 0;
      if (categoryScore > 0) {
        score += Math.min(categoryScore * 10, 30);
        reasons.push('同じカテゴリ');
      }

      // 2. タグマッチング（最大40点）
      let tagScore = 0;
      const matchedTags: string[] = [];
      if (prompt.tags) {
        prompt.tags.forEach(tag => {
          const count = tagCount.get(tag) || 0;
          if (count > 0) {
            tagScore += count * 5;
            matchedTags.push(tag);
          }
        });
      }
      if (tagScore > 0) {
        score += Math.min(tagScore, 40);
        reasons.push(`タグ: ${matchedTags.slice(0, 2).join(', ')}`);
      }

      // 3. 用途マッチング（最大20点）
      let useCaseScore = 0;
      prompt.useCase?.forEach(uc => {
        const count = useCaseCount.get(uc) || 0;
        if (count > 0) {
          useCaseScore += count * 5;
        }
      });
      if (useCaseScore > 0) {
        score += Math.min(useCaseScore, 20);
        reasons.push('同じ用途');
      }

      // 4. 人気度ボーナス（最大10点）
      const usageData = stats.mostUsedPrompts.find(item => item.promptId === prompt.id);
      if (usageData && usageData.count > 0) {
        score += Math.min(usageData.count, 10);
        reasons.push('人気');
      }

      // スコアが0より大きい場合のみ追加
      if (score > 0) {
        scores.set(prompt.id, { promptId: prompt.id, score, reasons });
      }
    });

    // スコア順にソートして上位を取得
    const sortedScores = Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    // プロンプトオブジェクトと理由を結合
    return sortedScores
      .map(item => {
        const prompt = allPrompts.find(p => p.id === item.promptId);
        return prompt ? { prompt, reasons: item.reasons } : null;
      })
      .filter((item): item is { prompt: Prompt; reasons: string[] } => item !== null);
  }, [allPrompts, favorites, stats.mostUsedPrompts, count]);

  return recommendedPrompts;
};
