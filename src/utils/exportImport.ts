import type { Prompt, FavoriteFolder } from '../types';

/**
 * プロンプトをJSON形式でエクスポート
 */
export const exportPromptsAsJSON = (prompts: Prompt[], filename: string = 'prompts.json') => {
  const dataStr = JSON.stringify(prompts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * プロンプトをCSV形式でエクスポート
 */
export const exportPromptsAsCSV = (prompts: Prompt[], filename: string = 'prompts.csv') => {
  // CSVヘッダー
  const headers = ['ID', 'タイトル', '内容', 'カテゴリ', '用途', 'タグ', '使い方', '例', 'プレミアム', '作成日', '更新日'];

  // データ行
  const rows = prompts.map(prompt => [
    prompt.id,
    `"${prompt.title.replace(/"/g, '""')}"`, // エスケープ
    `"${prompt.content.replace(/"/g, '""')}"`,
    prompt.category,
    prompt.useCase ? prompt.useCase.join(';') : '',
    prompt.tags.join(';'),
    prompt.usage ? `"${prompt.usage.replace(/"/g, '""')}"` : '',
    prompt.example ? `"${prompt.example.replace(/"/g, '""')}"` : '',
    prompt.isPremium ? 'Yes' : 'No',
    prompt.createdAt,
    prompt.updatedAt,
  ]);

  // CSV文字列を構築
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  // BOMを追加してExcelで文字化けしないようにする
  const bom = '\uFEFF';
  const dataBlob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * フォルダ情報をJSON形式でエクスポート
 */
export const exportFoldersAsJSON = (
  folders: FavoriteFolder[],
  prompts: Prompt[],
  filename: string = 'folders.json'
) => {
  const exportData = {
    folders,
    prompts,
    exportedAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * JSONファイルからプロンプトをインポート
 */
export const importPromptsFromJSON = (file: File): Promise<Prompt[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const prompts = JSON.parse(content) as Prompt[];

        // 基本的なバリデーション
        if (!Array.isArray(prompts)) {
          throw new Error('Invalid file format: expected an array of prompts');
        }

        // 必須フィールドの確認
        prompts.forEach((prompt, index) => {
          if (!prompt.id || !prompt.title || !prompt.content || !prompt.category) {
            throw new Error(`Invalid prompt at index ${index}: missing required fields`);
          }
        });

        resolve(prompts);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * JSONファイルからフォルダ情報をインポート
 */
export const importFoldersFromJSON = (
  file: File
): Promise<{ folders: FavoriteFolder[]; prompts: Prompt[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // バリデーション
        if (!data.folders || !Array.isArray(data.folders)) {
          throw new Error('Invalid file format: missing folders array');
        }

        if (!data.prompts || !Array.isArray(data.prompts)) {
          throw new Error('Invalid file format: missing prompts array');
        }

        resolve({
          folders: data.folders,
          prompts: data.prompts,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
