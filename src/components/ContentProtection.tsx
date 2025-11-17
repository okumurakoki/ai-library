import { useEffect } from 'react';

const ContentProtection = () => {
  useEffect(() => {
    // 右クリック禁止
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // テキスト選択禁止（ダイアログ内は除外）
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // ダイアログ内、ボタン内、input内は選択を許可
      if (target.closest('[role="dialog"]') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // コピー禁止（Ctrl+C、Cmd+C）
    const handleCopy = (e: ClipboardEvent) => {
      // コピーボタンからのコピーは許可するため、特定の条件でのみ禁止
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.hasAttribute('data-allow-copy')) {
        e.preventDefault();
        return false;
      }
    };

    // 開発者ツールを開くキーボードショートカットを禁止
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+J (Mac)
      if (e.metaKey && e.altKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+C (Mac)
      if (e.metaKey && e.altKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (ソース表示)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      // Cmd+U (Mac)
      if (e.metaKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // ドラッグ禁止（画像など）
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // イベントリスナー登録
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy as any);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // クリーンアップ
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy as any);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null; // UIを持たないコンポーネント
};

export default ContentProtection;
