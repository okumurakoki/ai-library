import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Bookmark as BookmarkIcon,
  Newspaper as NewspaperIcon,
  CreditCard as CreditCardIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Star as StarIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Create as CreateIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { UserButton } from '@clerk/clerk-react';
import { getUserPermissions } from '../utils/userPermissions';
import { CATEGORIES } from '../data/categories';
import type { FavoriteFolder } from '../types';

interface SidebarProps {
  open: boolean;
  selectedPage: string;
  selectedCategory: string;
  favoriteCount: number;
  customPromptCount: number;
  favoriteCategoryCounts: { [key: string]: number };
  folders: FavoriteFolder[];
  selectedFolder: string | null;
  isAdmin: boolean;
  user: any;
  onPageChange: (page: string) => void;
  onCategoryChange: (category: string) => void;
  onFolderSelect: (folderId: string | null) => void;
  onDrawerToggle: () => void;
  onOpenFolderDialog: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  selectedPage,
  selectedCategory,
  favoriteCount,
  customPromptCount,
  favoriteCategoryCounts,
  folders,
  selectedFolder,
  isAdmin,
  user,
  onPageChange,
  onCategoryChange,
  onFolderSelect,
  onDrawerToggle,
  onOpenFolderDialog,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const permissions = getUserPermissions(user);

  const drawerContent = (
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ p: 3, pt: 4, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ mb: 1.5 }}>
          <img
            src="/logo.png?v=1"
            alt="はじめて.AI"
            style={{
              width: '140px',
              height: 'auto',
              display: 'block'
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: '#666', mt: 0.5, fontSize: '0.75rem', pl: 0.5 }}>
          業種別プロンプト管理
        </Typography>
      </Box>

      {/* カテゴリ選択 */}
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth>
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            size="small"
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
                borderWidth: 2,
              },
            }}
          >
            <MenuItem value="all">すべてのプロンプト</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* 固定メニュー */}
      <List sx={{ flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'home'}
            onClick={() => {
              onPageChange('home');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="ホーム" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'favorites'}
            onClick={() => {
              onPageChange('favorites');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              opacity: permissions.canSaveFavorites ? 1 : 0.5,
            }}
          >
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText
              primary="保存したプロンプト"
              secondary={
                !permissions.canSaveFavorites
                  ? 'ログインが必要'
                  : favoriteCount > 0
                  ? permissions.maxFavorites !== null
                    ? `${favoriteCount} / ${permissions.maxFavorites}件`
                    : `${favoriteCount}件`
                  : undefined
              }
              secondaryTypographyProps={{
                sx: {
                  fontSize: '0.75rem',
                  color: !permissions.canSaveFavorites ? '#f44336' : '#666'
                }
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'custom'}
            onClick={() => {
              onPageChange('custom');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              opacity: permissions.canCreateCustomPrompts ? 1 : 0.5,
            }}
          >
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText
              primary="作成したプロンプト"
              secondary={
                !permissions.canCreateCustomPrompts
                  ? 'ログインが必要'
                  : customPromptCount > 0
                  ? permissions.maxCustomPrompts !== null
                    ? `${customPromptCount} / ${permissions.maxCustomPrompts}件`
                    : `${customPromptCount}件`
                  : undefined
              }
              secondaryTypographyProps={{
                sx: {
                  fontSize: '0.75rem',
                  color: !permissions.canCreateCustomPrompts ? '#f44336' : '#666'
                }
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'statistics'}
            onClick={() => {
              onPageChange('statistics');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              opacity: permissions.canViewStatistics ? 1 : 0.5,
            }}
          >
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText
              primary="統計"
              secondary={!permissions.canViewStatistics ? '有料プラン限定' : undefined}
              secondaryTypographyProps={{
                sx: { fontSize: '0.7rem', color: '#f44336' }
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* フォルダセクション（有料プラン限定） */}
        {permissions.canUseFolders && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem sx={{ px: 2, py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', fontSize: '0.875rem' }}>
                  フォルダ
                </Typography>
                <Button
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={onOpenFolderDialog}
                  sx={{
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                    color: '#666',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#000',
                    },
                  }}
                >
                  管理
                </Button>
              </Box>
            </ListItem>
            {folders.length > 0 && (
              <>
                {folders.map((folder) => (
                  <ListItem key={folder.id} disablePadding>
                    <ListItemButton
                      selected={selectedFolder === folder.id}
                      onClick={() => {
                        onFolderSelect(folder.id);
                        onPageChange('home');
                        if (isMobile) onDrawerToggle();
                      }}
                      sx={{
                        pl: 3,
                        '&.Mui-selected': {
                          backgroundColor: '#f5f5f5',
                          borderLeft: '3px solid #000',
                        },
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {selectedFolder === folder.id ? (
                          <FolderOpenIcon fontSize="small" />
                        ) : (
                          <FolderIcon fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={folder.name}
                        secondary={`${folder.promptIds.length}件`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontSize: '0.875rem' }
                        }}
                        secondaryTypographyProps={{
                          sx: { fontSize: '0.75rem', color: '#666' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'articles'}
            onClick={() => {
              onPageChange('articles');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              opacity: permissions.canViewArticles ? 1 : 0.5,
            }}
          >
            <ListItemIcon>
              <NewspaperIcon />
            </ListItemIcon>
            <ListItemText
              primary="記事・ニュース"
              secondary={!permissions.canViewArticles ? '有料プラン限定' : undefined}
              secondaryTypographyProps={{
                sx: { fontSize: '0.7rem', color: '#f44336' }
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'pricing'}
            onClick={() => {
              onPageChange('pricing');
              onFolderSelect(null);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#f5f5f5',
                borderLeft: '3px solid #000',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon>
              <CreditCardIcon />
            </ListItemIcon>
            <ListItemText primary="料金プラン" />
          </ListItemButton>
        </ListItem>

        {user && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={async () => {
                try {
                  console.log('Fetching customer ID for user:', user.id);
                  const customerResponse = await fetch('/api/get-customer-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                  });

                  console.log('Customer response status:', customerResponse.status);
                  if (!customerResponse.ok) {
                    const errorData = await customerResponse.json();
                    console.error('Customer fetch error:', errorData);
                    alert('サブスクリプションが見つかりません。先に料金プランに登録してください。');
                    return;
                  }

                  const { customerId } = await customerResponse.json();

                  const response = await fetch('/api/create-portal-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerId }),
                  });

                  const { url } = await response.json();
                  if (url) {
                    window.location.href = url;
                  }
                } catch (error) {
                  console.error('Portal error:', error);
                  alert('エラーが発生しました');
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="プラン管理"
                secondary="解約・変更"
                secondaryTypographyProps={{
                  sx: { fontSize: '0.75rem', color: '#666' }
                }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedPage === 'admin'}
                onClick={() => {
                  onPageChange('admin');
                  onFolderSelect(null);
                  if (isMobile) onDrawerToggle();
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#f5f5f5',
                    borderLeft: '3px solid #000',
                  },
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="管理者パネル" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* お気に入りカテゴリ */}
      {Object.keys(favoriteCategoryCounts).length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#666' }}>
              お気に入りカテゴリ
            </Typography>
            <List dense>
              {Object.entries(favoriteCategoryCounts).map(([catId, count]) => {
                const category = CATEGORIES.find((c) => c.id === catId);
                if (!category) return null;
                return (
                  <ListItem
                    key={catId}
                    disablePadding
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      onClick={() => {
                        onCategoryChange(catId);
                        onPageChange('home');
                        if (isMobile) onDrawerToggle();
                      }}
                      sx={{
                        borderRadius: 0,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <StarIcon fontSize="small" sx={{ color: '#000' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${category.name} ${count}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </>
      )}

      {/* ユーザー認証セクション */}
      <Box sx={{ mt: 'auto', borderTop: '1px solid #e0e0e0', p: 2 }}>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: 40,
                    height: 40,
                  },
                },
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName || user.primaryEmailAddress?.emailAddress || 'ユーザー'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                {(user.publicMetadata?.plan as string) === 'premium'
                  ? 'プレミアムプラン'
                  : (user.publicMetadata?.plan as string) === 'standard'
                  ? 'スタンダードプラン'
                  : '無料プラン'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={() => window.location.href = '/sign-in'}
              sx={{
                borderRadius: 0,
                borderColor: '#000',
                color: '#000',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#000',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              ログイン
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => window.location.href = '/sign-up'}
              sx={{
                borderRadius: 0,
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              新規登録
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* モバイル用の一時的なDrawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* デスクトップ用の固定Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
              border: 'none',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
