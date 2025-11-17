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
} from '@mui/icons-material';
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
  onPageChange,
  onCategoryChange,
  onFolderSelect,
  onDrawerToggle,
  onOpenFolderDialog,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            }}
          >
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText
              primary="保存したプロンプト"
              secondary={favoriteCount > 0 ? `${favoriteCount}件` : undefined}
              secondaryTypographyProps={{
                sx: { fontSize: '0.75rem', color: '#666' }
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
            }}
          >
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText
              primary="作成したプロンプト"
              secondary={customPromptCount > 0 ? `${customPromptCount}件` : undefined}
              secondaryTypographyProps={{
                sx: { fontSize: '0.75rem', color: '#666' }
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
            }}
          >
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="統計" />
          </ListItemButton>
        </ListItem>

        {/* フォルダセクション */}
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
            }}
          >
            <ListItemIcon>
              <NewspaperIcon />
            </ListItemIcon>
            <ListItemText primary="記事・ニュース" />
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
