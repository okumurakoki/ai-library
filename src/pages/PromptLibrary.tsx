import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Chip,
  Button,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  ImportExport as ImportExportIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { Prompt, FavoriteFolder } from '../types';
import type { UserPermissions } from '../utils/userPermissions';
import PromptCard from '../components/PromptCard';
import PromptDetailDialog from '../components/PromptDetailDialog';
import AddToFolderDialog from '../components/AddToFolderDialog';
import ExportImportDialog from '../components/ExportImportDialog';
import CustomPromptDialog from '../components/CustomPromptDialog';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { usePromptHistory } from '../hooks/usePromptHistory';

// 用途カテゴリの定義（中分類として使用）
const USE_CASES = [
  { id: 'all', label: 'すべて' },
  { id: 'writing', label: '文章作成' },
  { id: 'analysis', label: 'データ分析' },
  { id: 'communication', label: 'コミュニケーション' },
  { id: 'planning', label: '企画・計画' },
  { id: 'research', label: 'リサーチ' },
  { id: 'creative', label: 'クリエイティブ' },
  { id: 'automation', label: '業務自動化' },
  { id: 'learning', label: '学習・教育' },
];

interface PromptLibraryProps {
  prompts: Prompt[];
  selectedCategory: string;
  selectedPage: string;
  favorites: string[];
  customPrompts: Prompt[];
  userPlan: 'free' | 'premium';
  permissions: UserPermissions;
  onToggleFavorite: (promptId: string) => void;
  folders: FavoriteFolder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onAddToFolder: (folderId: string, promptId: string) => void;
  onRemoveFromFolder: (folderId: string, promptId: string) => void;
  onPromptCopy: (promptId: string) => void;
  onImportPrompts?: (prompts: Prompt[]) => void;
  onCreateCustomPrompt: (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCustomPrompt: (promptId: string, promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCustomPrompt: (promptId: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({
  prompts,
  selectedCategory,
  selectedPage,
  favorites,
  customPrompts,
  userPlan,
  permissions,
  onToggleFavorite,
  folders,
  onCreateFolder: _onCreateFolder,
  onDeleteFolder: _onDeleteFolder,
  onRenameFolder: _onRenameFolder,
  onAddToFolder,
  onRemoveFromFolder,
  onPromptCopy,
  onImportPrompts,
  onCreateCustomPrompt,
  onUpdateCustomPrompt,
  onDeleteCustomPrompt: _onDeleteCustomPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchMode, setTagSearchMode] = useState<'AND' | 'OR'>('OR');
  const [showTagCloud, setShowTagCloud] = useState(false); // 大量データのためデフォルトは非表示
  const [addToFolderDialogOpen, setAddToFolderDialogOpen] = useState(false);
  const [promptToAddToFolder, setPromptToAddToFolder] = useState<Prompt | null>(null);
  const [exportImportDialogOpen, setExportImportDialogOpen] = useState(false);
  const [customPromptDialogOpen, setCustomPromptDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [searchHistoryAnchorEl, setSearchHistoryAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'default' | 'popular' | 'favorite' | 'name'>('default');

  const { recentSearches, popularSearches, recordSearch, deleteSearchHistoryItem, clearSearchHistory } =
    useSearchHistory();
  const { stats } = usePromptHistory();

  // 全タグの抽出とタグクラウド用のデータ作成（大分類と中分類でフィルタリング後）
  const allTags = useMemo(() => {
    const tagCount = new Map<string, number>();

    // 大分類と中分類でフィルタリングされたプロンプトからタグを抽出
    let relevantPrompts = prompts;

    // 大分類: カテゴリフィルター
    if (selectedCategory !== 'all') {
      relevantPrompts = relevantPrompts.filter((p) => p.category === selectedCategory);
    }

    // 中分類: 用途カテゴリフィルター
    if (selectedUseCase !== 'all') {
      relevantPrompts = relevantPrompts.filter((p) => {
        if (p.useCase && p.useCase.includes(selectedUseCase)) {
          return true;
        }
        return p.tags.includes(selectedUseCase);
      });
    }

    // フィルタリングされたプロンプトからタグを集計
    relevantPrompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    // 使用頻度順にソート
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [prompts, selectedCategory, selectedUseCase]);

  // フィルタリングされたプロンプト（階層的フィルタリング）
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // 大分類: カテゴリフィルター（サイドバーで選択）
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // 中分類: 用途カテゴリフィルター
    if (selectedUseCase !== 'all') {
      filtered = filtered.filter((p) => {
        // useCase配列に含まれているかチェック（新形式）
        if (p.useCase && p.useCase.includes(selectedUseCase)) {
          return true;
        }
        // 後方互換: tagsにも含まれているかチェック（旧形式）
        return p.tags.includes(selectedUseCase);
      });
    }

    // 小分類: タグフィルター（AND/OR検索切り替え可能）
    if (selectedTags.length > 0) {
      if (tagSearchMode === 'AND') {
        // AND検索: すべてのタグを含む
        filtered = filtered.filter((p) =>
          selectedTags.every((tag) => p.tags.includes(tag))
        );
      } else {
        // OR検索: いずれかのタグを含む
        filtered = filtered.filter((p) =>
          selectedTags.some((tag) => p.tags.includes(tag))
        );
      }
    }

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (p.useCase && p.useCase.some((uc) => uc.toLowerCase().includes(query)))
      );
    }

    // ソート処理
    if (sortBy === 'popular') {
      // 人気順（使用回数順）
      const usageMap = new Map(stats.mostUsedPrompts.map(item => [item.promptId, item.count]));
      filtered = [...filtered].sort((a, b) => {
        const countA = usageMap.get(a.id) || 0;
        const countB = usageMap.get(b.id) || 0;
        return countB - countA;
      });
    } else if (sortBy === 'favorite') {
      // お気に入り順（お気に入りが先、その後は元の順序）
      filtered = [...filtered].sort((a, b) => {
        const aIsFav = favorites.includes(a.id) ? 1 : 0;
        const bIsFav = favorites.includes(b.id) ? 1 : 0;
        return bIsFav - aIsFav;
      });
    } else if (sortBy === 'name') {
      // 名前順（五十音順）
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    }
    // default の場合はそのまま（元の順序 = 新着順）

    return filtered;
  }, [prompts, selectedCategory, selectedUseCase, selectedTags, tagSearchMode, searchQuery, sortBy, stats.mostUsedPrompts, favorites]);

  const handleOpenDetail = (prompt: Prompt) => {
    console.log('Opening detail for prompt:', prompt.id, prompt.title);
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  const handleCloseDetail = () => {
    console.log('Closing detail dialog');
    setDialogOpen(false);
    setSelectedPrompt(null);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      recordSearch(query);
    }
  };

  const handleSearchHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
    setSearchHistoryAnchorEl(event.currentTarget);
  };

  const handleSearchHistoryClose = () => {
    setSearchHistoryAnchorEl(null);
  };

  const handleSelectHistoryItem = (query: string) => {
    setSearchQuery(query);
    recordSearch(query);
    handleSearchHistoryClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダーとプロンプト数 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          プロンプト辞典
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {(selectedPage === 'home' || selectedPage === 'custom' || selectedPage === 'favorites') && permissions.canCreateCustomPrompts && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                // 無料ユーザーの場合、上限チェック
                if (permissions.maxCustomPrompts !== null && customPrompts.length >= permissions.maxCustomPrompts) {
                  alert(`カスタムプロンプトは${permissions.maxCustomPrompts}個までです。プレミアムプランにアップグレードすると無制限に作成できます。`);
                  return;
                }
                setEditingPrompt(null);
                setCustomPromptDialogOpen(true);
              }}
              disabled={permissions.maxCustomPrompts !== null && customPrompts.length >= permissions.maxCustomPrompts}
              sx={{
                borderRadius: 0,
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                px: 2,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              プロンプトを作成
            </Button>
          )}
          {permissions.canExportImport && (
            <Button
              variant="outlined"
              startIcon={<ImportExportIcon />}
              onClick={() => setExportImportDialogOpen(true)}
              sx={{
                borderRadius: 0,
                borderColor: '#000',
                color: '#000',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: '#000',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              エクスポート/インポート
            </Button>
          )}
          <Chip
            label={`${filteredPrompts.length}件のプロンプト`}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 0,
            }}
          />
        </Box>
      </Box>

      {/* 検索バーと表示切り替え */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          fullWidth
          placeholder="プロンプトを検索..."
          value={searchQuery}
          onChange={(e) => handleSearchQueryChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleSearchHistoryClick}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <HistoryIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
                borderWidth: 2,
              },
            },
          }}
        />
        <FormControl sx={{ minWidth: 150, flexShrink: 0 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            displayEmpty
            sx={{
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
              },
            }}
          >
            <MenuItem value="default">新着順</MenuItem>
            <MenuItem value="popular">人気順</MenuItem>
            <MenuItem value="favorite">お気に入り順</MenuItem>
            <MenuItem value="name">名前順</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
          sx={{
            flexShrink: 0,
            '& .MuiToggleButton-root': {
              borderRadius: 0,
              borderColor: '#e0e0e0',
              color: '#666',
              whiteSpace: 'nowrap',
              minWidth: 120,
              '&.Mui-selected': {
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                },
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            },
          }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon sx={{ mr: 1 }} />
            グリッド
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 1 }} />
            リスト
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 用途で絞り込み（中分類） */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          用途で絞り込み
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {USE_CASES.map((useCase) => (
            <Chip
              key={useCase.id}
              label={useCase.label}
              onClick={() => setSelectedUseCase(useCase.id)}
              sx={{
                borderRadius: 0,
                backgroundColor: selectedUseCase === useCase.id ? '#000' : '#fff',
                color: selectedUseCase === useCase.id ? '#fff' : '#000',
                border: '1px solid #000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: selectedUseCase === useCase.id ? '#333' : '#f5f5f5',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* タグで絞り込み（小分類） */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            タグで絞り込み（複数選択可）
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {selectedTags.length > 0 && (
              <>
                <ToggleButtonGroup
                  value={tagSearchMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) {
                      setTagSearchMode(newMode);
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: 0,
                      borderColor: '#000',
                      color: '#666',
                      fontSize: '0.7rem',
                      px: 1.5,
                      py: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: '#000',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#333',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="OR">OR</ToggleButton>
                  <ToggleButton value="AND">AND</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  size="small"
                  onClick={() => setSelectedTags([])}
                  sx={{
                    fontSize: '0.75rem',
                    color: '#666',
                    textDecoration: 'underline',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                    },
                  }}
                >
                  すべてクリア
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowTagCloud(!showTagCloud)}
              sx={{
                borderRadius: 0,
                borderColor: '#000',
                color: '#000',
                fontSize: '0.75rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              {showTagCloud ? '非表示にする' : 'タグを表示'}
            </Button>
          </Box>
        </Box>
        {showTagCloud && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {allTags.map(({ tag, count }) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={`${tag} (${count})`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: isSelected ? '#000' : '#fff',
                    color: isSelected ? '#fff' : '#666',
                    border: isSelected ? '2px solid #000' : '1px solid #e0e0e0',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '0.85rem',
                    '&:hover': {
                      backgroundColor: isSelected ? '#333' : '#f5f5f5',
                      borderColor: '#000',
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* 検索結果の件数表示 */}
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        {filteredPrompts.length}件のプロンプトが見つかりました
      </Typography>

      {/* プロンプト一覧 */}
      {viewMode === 'grid' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              viewMode="grid"
              isFavorite={favorites.includes(prompt.id)}
              canCopy={permissions.canCopyPrompts}
              canSave={permissions.canSaveFavorites}
              onToggleFavorite={onToggleFavorite}
              onOpenDetail={handleOpenDetail}
              onAddToFolder={(p) => {
                setPromptToAddToFolder(p);
                setAddToFolderDialogOpen(true);
              }}
              onCopy={onPromptCopy}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              viewMode="list"
              isFavorite={favorites.includes(prompt.id)}
              canCopy={permissions.canCopyPrompts}
              canSave={permissions.canSaveFavorites}
              onToggleFavorite={onToggleFavorite}
              onOpenDetail={handleOpenDetail}
              onAddToFolder={(p) => {
                setPromptToAddToFolder(p);
                setAddToFolderDialogOpen(true);
              }}
              onCopy={onPromptCopy}
            />
          ))}
        </Box>
      )}

      {/* 検索結果がない場合 */}
      {filteredPrompts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            プロンプトが見つかりませんでした
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            別のキーワードで検索してください
          </Typography>
        </Box>
      )}

      {/* プロンプト詳細ダイアログ */}
      <PromptDetailDialog
        open={dialogOpen}
        prompt={selectedPrompt}
        isFavorite={selectedPrompt ? favorites.includes(selectedPrompt.id) : false}
        canCopy={permissions.canCopyPrompts}
        canSave={permissions.canSaveFavorites}
        onClose={handleCloseDetail}
        onToggleFavorite={onToggleFavorite}
        onCopy={onPromptCopy}
      />

      {/* フォルダに追加ダイアログ */}
      <AddToFolderDialog
        open={addToFolderDialogOpen}
        onClose={() => {
          setAddToFolderDialogOpen(false);
          setPromptToAddToFolder(null);
        }}
        prompt={promptToAddToFolder}
        folders={folders}
        onAddToFolder={onAddToFolder}
        onRemoveFromFolder={onRemoveFromFolder}
      />

      {/* エクスポート/インポートダイアログ */}
      <ExportImportDialog
        open={exportImportDialogOpen}
        onClose={() => setExportImportDialogOpen(false)}
        prompts={filteredPrompts}
        folders={folders}
        onImportPrompts={onImportPrompts}
      />

      {/* カスタムプロンプト作成/編集ダイアログ */}
      <CustomPromptDialog
        open={customPromptDialogOpen}
        onClose={() => {
          setCustomPromptDialogOpen(false);
          setEditingPrompt(null);
        }}
        onSave={(promptData) => {
          if (editingPrompt) {
            onUpdateCustomPrompt(editingPrompt.id, promptData);
          } else {
            onCreateCustomPrompt(promptData);
          }
          setCustomPromptDialogOpen(false);
          setEditingPrompt(null);
        }}
        editingPrompt={editingPrompt}
        currentPromptCount={customPrompts.length}
        userPlan={userPlan}
      />

      {/* 検索履歴ポップオーバー */}
      <Popover
        open={Boolean(searchHistoryAnchorEl)}
        anchorEl={searchHistoryAnchorEl}
        onClose={handleSearchHistoryClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '1px solid #e0e0e0',
            minWidth: 300,
            maxWidth: 400,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* 最近の検索 */}
          {recentSearches.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon fontSize="small" />
                  最近の検索
                </Typography>
                <Button
                  size="small"
                  onClick={clearSearchHistory}
                  sx={{
                    fontSize: '0.7rem',
                    color: '#666',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                    },
                  }}
                >
                  すべてクリア
                </Button>
              </Box>
              <List dense sx={{ py: 0 }}>
                {recentSearches.map((item) => (
                  <ListItem
                    key={item.query}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSearchHistoryItem(item.query);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleSelectHistoryItem(item.query)}
                      sx={{
                        borderRadius: 0,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.query}
                        secondary={`${item.count}回検索`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* 人気の検索 */}
          {popularSearches.length > 0 && popularSearches.some(item => item.count > 1) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon fontSize="small" />
                  人気の検索
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {popularSearches
                    .filter(item => item.count > 1)
                    .slice(0, 3)
                    .map((item) => (
                      <ListItem
                        key={item.query}
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => handleSelectHistoryItem(item.query)}
                          sx={{
                            borderRadius: 0,
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          <ListItemText
                            primary={item.query}
                            secondary={`${item.count}回検索`}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              </Box>
            </>
          )}

          {recentSearches.length === 0 && (
            <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 2 }}>
              検索履歴はありません
            </Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default PromptLibrary;
