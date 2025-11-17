import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { FavoriteFolder } from '../types';

interface FavoriteFolderDialogProps {
  open: boolean;
  onClose: () => void;
  folders: FavoriteFolder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
}

const FavoriteFolderDialog: React.FC<FavoriteFolderDialogProps> = ({
  open,
  onClose,
  folders,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      setError('フォルダ名を入力してください');
      return;
    }

    if (folders.some((f) => f.name === newFolderName.trim())) {
      setError('同じ名前のフォルダがすでに存在します');
      return;
    }

    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setError('');
  };

  const handleStartEdit = (folder: FavoriteFolder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      setError('フォルダ名を入力してください');
      return;
    }

    if (
      folders.some(
        (f) => f.name === editingName.trim() && f.id !== editingFolderId
      )
    ) {
      setError('同じ名前のフォルダがすでに存在します');
      return;
    }

    if (editingFolderId) {
      onRenameFolder(editingFolderId, editingName.trim());
      setEditingFolderId(null);
      setEditingName('');
      setError('');
    }
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingName('');
    setError('');
  };

  const handleDelete = (folderId: string) => {
    if (
      window.confirm(
        'このフォルダを削除しますか？フォルダ内のお気に入りは削除されません。'
      )
    ) {
      onDeleteFolder(folderId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '2px solid #000',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          お気に入りフォルダ管理
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {/* 新規フォルダ作成 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            新しいフォルダを作成
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="フォルダ名"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleCreateFolder}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 0,
                backgroundColor: '#000',
                color: '#fff',
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              作成
            </Button>
          </Box>
        </Box>

        {/* フォルダ一覧 */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            フォルダ一覧（{folders.length}件）
          </Typography>
          {folders.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: '#666',
              }}
            >
              <Typography variant="body2">
                フォルダがありません。新しいフォルダを作成してください。
              </Typography>
            </Box>
          ) : (
            <List sx={{ border: '1px solid #e0e0e0' }}>
              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  {editingFolderId === folder.id ? (
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 0,
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSaveEdit}
                        sx={{ borderRadius: 0, backgroundColor: '#000' }}
                      >
                        保存
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancelEdit}
                        sx={{ borderRadius: 0, borderColor: '#000', color: '#000' }}
                      >
                        キャンセル
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <FolderIcon sx={{ mr: 2, color: '#666' }} />
                      <ListItemText
                        primary={folder.name}
                        secondary={`${folder.promptIds.length}件のプロンプト`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleStartEdit(folder)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(folder.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: '#000',
            color: '#000',
            borderRadius: 0,
            '&:hover': {
              borderColor: '#000',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FavoriteFolderDialog;
