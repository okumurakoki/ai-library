import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as DownloadIcon,
  FileUpload as UploadIcon,
  Description as JSONIcon,
  TableChart as CSVIcon,
} from '@mui/icons-material';
import type { Prompt, FavoriteFolder } from '../types';
import {
  exportPromptsAsJSON,
  exportPromptsAsCSV,
  exportFoldersAsJSON,
  importPromptsFromJSON,
  importFoldersFromJSON,
} from '../utils/exportImport';

interface ExportImportDialogProps {
  open: boolean;
  onClose: () => void;
  prompts: Prompt[];
  folders?: FavoriteFolder[];
  onImportPrompts?: (prompts: Prompt[]) => void;
  onImportFolders?: (folders: FavoriteFolder[], prompts: Prompt[]) => void;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  open,
  onClose,
  prompts,
  folders,
  onImportPrompts,
  onImportFolders,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportPromptsAsJSON(prompts, `prompts_${timestamp}.json`);
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportPromptsAsCSV(prompts, `prompts_${timestamp}.csv`);
  };

  const handleExportFoldersJSON = () => {
    if (!folders) return;
    const timestamp = new Date().toISOString().split('T')[0];
    exportFoldersAsJSON(folders, prompts, `folders_${timestamp}.json`);
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      if (file.name.endsWith('.json')) {
        // フォルダ情報を含むJSONか、プロンプトのみのJSONかを判定
        const content = await file.text();
        const data = JSON.parse(content);

        if (data.folders && data.prompts) {
          // フォルダ情報を含むインポート
          const result = await importFoldersFromJSON(file);
          if (onImportFolders) {
            onImportFolders(result.folders, result.prompts);
            setImportSuccess(
              `${result.prompts.length}件のプロンプトと${result.folders.length}個のフォルダをインポートしました`
            );
          }
        } else {
          // プロンプトのみのインポート
          const importedPrompts = await importPromptsFromJSON(file);
          if (onImportPrompts) {
            onImportPrompts(importedPrompts);
            setImportSuccess(`${importedPrompts.length}件のプロンプトをインポートしました`);
          }
        }
      } else {
        setImportError('JSONファイルのみサポートしています');
      }
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました'
      );
    }

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          エクスポート / インポート
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: '1px solid #e0e0e0',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab icon={<DownloadIcon />} label="エクスポート" iconPosition="start" />
          <Tab icon={<UploadIcon />} label="インポート" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                現在の{prompts.length}件のプロンプトをエクスポートします
              </Typography>

              <List>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={handleExportJSON}
                    sx={{
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <JSONIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="JSON形式でエクスポート"
                      secondary="他のツールとの連携や再インポートに最適"
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={handleExportCSV}
                    sx={{
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <CSVIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="CSV形式でエクスポート"
                      secondary="ExcelやGoogleスプレッドシートで編集可能"
                    />
                  </ListItemButton>
                </ListItem>

                {folders && folders.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={handleExportFoldersJSON}
                        sx={{
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <JSONIcon />
                        </ListItemIcon>
                        <ListItemText
                        primary="フォルダごとエクスポート (JSON)"
                        secondary="フォルダ構造とプロンプトをまとめて保存"
                      />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                以前エクスポートしたプロンプトをインポートします
              </Typography>

              {importError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
                  {importError}
                </Alert>
              )}

              {importSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }}>
                  {importSuccess}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={handleImportClick}
                sx={{
                  backgroundColor: '#000',
                  color: '#fff',
                  py: 2,
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
              >
                JSONファイルを選択
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#999' }}>
                ※ インポートしたプロンプトは既存のプロンプトに追加されます
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportImportDialog;
