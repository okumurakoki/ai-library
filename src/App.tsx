import { useState, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useUser } from '@clerk/clerk-react';
import Sidebar from './components/Sidebar';
import PromptLibrary from './pages/PromptLibrary';
import Articles from './pages/Articles';
import PricingPlan from './pages/PricingPlan';
import AdminPanel from './pages/AdminPanel';
import Statistics from './pages/Statistics';
import PaymentSuccess from './pages/PaymentSuccess';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import FavoriteFolderDialog from './components/FavoriteFolderDialog';
import { SAMPLE_PROMPTS } from './data/prompts';
import { useFavorites } from './hooks/useFavorites';
import { useCustomPrompts } from './hooks/useCustomPrompts';
import { useFolders } from './hooks/useFolders';
import { usePromptHistory } from './hooks/usePromptHistory';
import { getUserPermissions } from './utils/userPermissions';
import type { FavoriteFolder, Prompt } from './types';

// Material-UIテーマのカスタマイズ
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

function App() {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { favorites, toggleFavorite: originalToggleFavorite } = useFavorites();
  const { customPrompts, addCustomPrompt, updateCustomPrompt, deleteCustomPrompt } = useCustomPrompts();
  const { folders: favoriteFolders, addFolder, updateFolder, deleteFolder } = useFolders();
  const { recordPromptUse } = usePromptHistory();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [allPrompts, setAllPrompts] = useState([...SAMPLE_PROMPTS]);

  // URLパラメータをチェックしてサンクスページを表示
  const urlParams = new URLSearchParams(window.location.search);
  const showPaymentSuccess = urlParams.get('payment') === 'success';

  // サインイン・サインアップページかどうかをチェック
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up';

  // ユーザーがログインした時に一度だけプランを同期
  useMemo(() => {
    if (user && !showPaymentSuccess && !isAuthPage) {
      // ローカルストレージでプラン同期済みかチェック
      const lastSync = localStorage.getItem(`plan_sync_${user.id}`);
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;

      // 1時間以内に同期済みでなければ同期
      if (!lastSync || now - parseInt(lastSync) > ONE_HOUR) {
        fetch('/api/sync-user-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
          .then(res => res.json())
          .then(data => {
            console.log('Background plan sync:', data.plan);
            localStorage.setItem(`plan_sync_${user.id}`, now.toString());
          })
          .catch(err => console.error('Background sync failed:', err));
      }
    }
  }, [user, showPaymentSuccess, isAuthPage]);

  // ユーザー権限を取得
  const permissions = getUserPermissions(user);
  const userPlan = (user?.publicMetadata?.plan as 'free' | 'premium') || 'free';
  const isAdmin = permissions.isAdmin;

  // カスタムプロンプトとサンプルプロンプトを統合
  useMemo(() => {
    setAllPrompts([...SAMPLE_PROMPTS, ...customPrompts]);
  }, [customPrompts]);

  // お気に入りカテゴリごとの件数を計算
  const favoriteCategoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    favorites.forEach((favId) => {
      const prompt = allPrompts.find((p) => p.id === favId);
      if (prompt) {
        counts[prompt.category] = (counts[prompt.category] || 0) + 1;
      }
    });
    return counts;
  }, [favorites, allPrompts]);

  // 表示するプロンプトをフィルタリング
  const displayPrompts = useMemo(() => {
    let prompts: Prompt[] = [];

    // お気に入りページ
    if (selectedPage === 'favorites') {
      prompts = allPrompts.filter((p) => favorites.includes(p.id));
    }
    // 作成したプロンプトページ
    else if (selectedPage === 'custom') {
      prompts = customPrompts;
    }
    // フォルダが選択されている場合
    else if (selectedFolder) {
      const folder = favoriteFolders.find((f) => f.id === selectedFolder);
      if (folder) {
        prompts = allPrompts.filter((p) => folder.promptIds.includes(p.id));
      }
    }
    // ホームページ: サンプルプロンプトのみ（カスタムプロンプトを除外）
    else if (selectedPage === 'home') {
      prompts = SAMPLE_PROMPTS;
    } else {
      prompts = allPrompts;
    }

    // 権限に応じて表示数を制限
    if (permissions.maxVisiblePrompts !== null && selectedPage === 'home') {
      return prompts.slice(0, permissions.maxVisiblePrompts);
    }

    return prompts;
  }, [selectedPage, favorites, selectedFolder, favoriteFolders, allPrompts, customPrompts, permissions]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handlePageChange = (page: string) => {
    setSelectedPage(page);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // お気に入りのトグル（権限チェック付き）
  const toggleFavorite = (promptId: string) => {
    // 権限チェック
    if (!permissions.canSaveFavorites) {
      alert('お気に入りに保存するにはログインが必要です。');
      return;
    }

    // 追加する場合は上限チェック
    if (!favorites.includes(promptId)) {
      if (permissions.maxFavorites !== null && favorites.length >= permissions.maxFavorites) {
        alert(`お気に入りは${permissions.maxFavorites}個までです。プレミアムプランにアップグレードすると無制限に保存できます。`);
        return;
      }
    }

    originalToggleFavorite(promptId);
  };

  // フォルダ管理関数
  const handleCreateFolder = (name: string) => {
    const newFolder: FavoriteFolder = {
      id: `folder-${Date.now()}`,
      name,
      promptIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addFolder(newFolder);
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    updateFolder(folderId, {
      name: newName,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddToFolder = (folderId: string, promptId: string) => {
    const folder = favoriteFolders.find((f) => f.id === folderId);
    if (folder) {
      updateFolder(folderId, {
        promptIds: [...folder.promptIds, promptId],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleRemoveFromFolder = (folderId: string, promptId: string) => {
    const folder = favoriteFolders.find((f) => f.id === folderId);
    if (folder) {
      updateFolder(folderId, {
        promptIds: folder.promptIds.filter((id) => id !== promptId),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleImportPrompts = (importedPrompts: import('./types').Prompt[]) => {
    // 重複チェック: 既存のIDと被らないようにする
    const existingIds = new Set(allPrompts.map(p => p.id));
    const newPrompts = importedPrompts.map(p => {
      if (existingIds.has(p.id)) {
        // IDが重複する場合は新しいIDを生成
        return { ...p, id: `imported-${Date.now()}-${Math.random()}` };
      }
      return p;
    });

    setAllPrompts([...allPrompts, ...newPrompts]);
  };

  // カスタムプロンプト管理
  const handleCreateCustomPrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    // 作成数制限チェック
    if (permissions.maxCustomPrompts !== null && customPrompts.length >= permissions.maxCustomPrompts) {
      alert(`カスタムプロンプトは${permissions.maxCustomPrompts}個までです。上位プランにアップグレードすると、より多く作成できます。`);
      return;
    }

    const newPrompt: Prompt = {
      ...promptData,
      id: `custom-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addCustomPrompt(newPrompt);
  };

  const handleUpdateCustomPrompt = (promptId: string, promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateCustomPrompt(promptId, {
      ...promptData,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteCustomPrompt = (promptId: string) => {
    deleteCustomPrompt(promptId);
  };

  // ローディング中の表示
  if (!isLoaded) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>読み込み中...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // 決済完了ページを表示
  if (showPaymentSuccess) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PaymentSuccess />
      </ThemeProvider>
    );
  }

  // サインイン・サインアップページの場合はルーティングで表示
  if (isAuthPage) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Routes>
      </ThemeProvider>
    );
  }

  // ログインしていない場合は、サインインページを表示（リダイレクトではなく直接表示）
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SignInPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <ContentProtection /> */}
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          // userSelect: 'none',
          // WebkitUserSelect: 'none',
          // MozUserSelect: 'none',
          // msUserSelect: 'none',
        }}
      >
        {/* サイドバー */}
        <Sidebar
          open={drawerOpen}
          selectedPage={selectedPage}
          selectedCategory={selectedCategory}
          favoriteCount={favorites.length}
          customPromptCount={customPrompts.length}
          favoriteCategoryCounts={favoriteCategoryCounts}
          folders={favoriteFolders}
          selectedFolder={selectedFolder}
          isAdmin={isAdmin}
          user={user}
          onPageChange={handlePageChange}
          onCategoryChange={handleCategoryChange}
          onFolderSelect={setSelectedFolder}
          onDrawerToggle={handleDrawerToggle}
          onOpenFolderDialog={() => setFolderDialogOpen(true)}
        />

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - 300px)` },
            backgroundColor: '#fff',
            overflowY: 'auto',
          }}
        >
          {/* ページコンテンツ */}
          {selectedPage === 'home' && (
            <PromptLibrary
              prompts={displayPrompts}
              selectedCategory={selectedCategory}
              selectedPage={selectedPage}
              favorites={favorites}
              customPrompts={customPrompts}
              userPlan={userPlan}
              permissions={permissions}
              onToggleFavorite={toggleFavorite}
              folders={favoriteFolders}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameFolder={handleRenameFolder}
              onAddToFolder={handleAddToFolder}
              onRemoveFromFolder={handleRemoveFromFolder}
              onPromptCopy={recordPromptUse}
              onImportPrompts={handleImportPrompts}
              onCreateCustomPrompt={handleCreateCustomPrompt}
              onUpdateCustomPrompt={handleUpdateCustomPrompt}
              onDeleteCustomPrompt={handleDeleteCustomPrompt}
            />
          )}

          {selectedPage === 'favorites' && (
            permissions.canSaveFavorites ? (
              <PromptLibrary
                prompts={displayPrompts}
                selectedCategory={selectedCategory}
                selectedPage={selectedPage}
                favorites={favorites}
                customPrompts={customPrompts}
                userPlan={userPlan}
                permissions={permissions}
                onToggleFavorite={toggleFavorite}
                folders={favoriteFolders}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
                onAddToFolder={handleAddToFolder}
                onRemoveFromFolder={handleRemoveFromFolder}
                onPromptCopy={recordPromptUse}
                onImportPrompts={handleImportPrompts}
                onCreateCustomPrompt={handleCreateCustomPrompt}
                onUpdateCustomPrompt={handleUpdateCustomPrompt}
                onDeleteCustomPrompt={handleDeleteCustomPrompt}
              />
            ) : <PricingPlan />
          )}

          {selectedPage === 'custom' && (
            permissions.canCreateCustomPrompts ? (
              <PromptLibrary
                prompts={displayPrompts}
                selectedCategory={selectedCategory}
                selectedPage={selectedPage}
                favorites={favorites}
                customPrompts={customPrompts}
                userPlan={userPlan}
                permissions={permissions}
                onToggleFavorite={toggleFavorite}
                folders={favoriteFolders}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
                onAddToFolder={handleAddToFolder}
                onRemoveFromFolder={handleRemoveFromFolder}
                onPromptCopy={recordPromptUse}
                onImportPrompts={handleImportPrompts}
                onCreateCustomPrompt={handleCreateCustomPrompt}
                onUpdateCustomPrompt={handleUpdateCustomPrompt}
                onDeleteCustomPrompt={handleDeleteCustomPrompt}
              />
            ) : <PricingPlan />
          )}

          {selectedPage === 'articles' && (
            permissions.canViewArticles ? <Articles /> : <PricingPlan />
          )}

          {selectedPage === 'pricing' && <PricingPlan />}

          {selectedPage === 'statistics' && (
            permissions.canViewStatistics ? <Statistics /> : <PricingPlan />
          )}

          {selectedPage === 'admin' && isAdmin && <AdminPanel />}
        </Box>
      </Box>

      {/* フォルダ管理ダイアログ */}
      <FavoriteFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        folders={favoriteFolders}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
      />
    </ThemeProvider>
  );
}

export default App;
