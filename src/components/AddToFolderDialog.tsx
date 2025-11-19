import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Checkbox,
} from '@mui/material';
import {
  Close as CloseIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import type { FavoriteFolder, Prompt } from '../types';

interface AddToFolderDialogProps {
  open: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  folders: FavoriteFolder[];
  onAddToFolder: (folderId: string, promptId: string) => void;
  onRemoveFromFolder: (folderId: string, promptId: string) => void;
}

const AddToFolderDialog: React.FC<AddToFolderDialogProps> = ({
  open,
  onClose,
  prompt,
  folders,
  onAddToFolder,
  onRemoveFromFolder,
}) => {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  React.useEffect(() => {
    if (prompt && open) {
      // 現在のプロンプトが含まれているフォルダを選択状態にする
      const folderIds = folders
        .filter((folder) => Array.isArray(folder.promptIds) && folder.promptIds.includes(prompt.id))
        .map((folder) => folder.id);
      setSelectedFolders(folderIds);
    }
  }, [prompt, folders, open]);

  const handleToggleFolder = (folderId: string) => {
    if (!prompt) return;

    if (selectedFolders.includes(folderId)) {
      setSelectedFolders(selectedFolders.filter((id) => id !== folderId));
      onRemoveFromFolder(folderId, prompt.id);
    } else {
      setSelectedFolders([...selectedFolders, folderId]);
      onAddToFolder(folderId, prompt.id);
    }
  };

  if (!prompt) return null;

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
          フォルダに追加
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          「{prompt.title}」を追加するフォルダを選択してください
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
              フォルダがありません。先にフォルダを作成してください。
            </Typography>
          </Box>
        ) : (
          <List sx={{ border: '1px solid #e0e0e0' }}>
            {folders.map((folder) => {
              const isSelected = selectedFolders.includes(folder.id);
              return (
                <ListItem
                  key={folder.id}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleToggleFolder(folder.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        sx={{
                          color: '#000',
                          '&.Mui-checked': {
                            color: '#000',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <FolderIcon sx={{ mr: 2, color: '#666' }} />
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder.promptIds?.length || 0}件のプロンプト`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 0,
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          完了
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToFolderDialog;
