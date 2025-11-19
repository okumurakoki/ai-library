import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  IconButton,
  Stack,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import type { Prompt } from '../types';
import { getCategoryName } from '../data/categories';

interface PromptDetailDialogProps {
  open: boolean;
  prompt: Prompt | null;
  isFavorite: boolean;
  canCopy?: boolean;
  canSave?: boolean;
  onClose: () => void;
  onToggleFavorite: (promptId: string) => void;
  onCopy: (promptId: string) => void;
}

const PromptDetailDialog: React.FC<PromptDetailDialogProps> = ({
  open,
  prompt,
  isFavorite,
  canCopy = true,
  canSave = true,
  onClose,
  onToggleFavorite,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({});
  const [showVariableInputs, setShowVariableInputs] = useState(false);

  // プロンプトから変数を抽出
  const variables = useMemo(() => {
    if (!prompt) return [];
    const matches = prompt.content.match(/\{\{[^}]+\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.slice(2, -2).trim())));
  }, [prompt]);

  // 変数が置換されたプロンプトテキストを生成
  const replacedContent = useMemo(() => {
    if (!prompt) return '';
    let content = prompt.content;
    Object.entries(variableValues).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        content = content.replace(regex, value);
      }
    });
    return content;
  }, [prompt, variableValues]);

  console.log('PromptDetailDialog render:', { open, promptId: prompt?.id, promptTitle: prompt?.title });

  if (!prompt) return null;

  const handleCopy = () => {
    const textToCopy = Object.keys(variableValues).length > 0 ? replacedContent : prompt.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onCopy(prompt.id); // 使用履歴を記録
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleResetVariables = () => {
    setVariableValues({});
    setShowVariableInputs(false);
  };

  // プロンプト内の変数をハイライト表示
  const highlightVariables = (text: string) => {
    const parts = text.split(/(\[.*?\]|\$\{.*?\}|\{\{.*?\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\[.*?\]$/) || part.match(/^\$\{.*?\}$/) || part.match(/^\{\{.*?\}\}$/)) {
        return (
          <Box
            component="span"
            key={index}
            sx={{
              backgroundColor: '#fff59d',
              padding: '2px 4px',
              fontWeight: 600,
            }}
          >
            {part}
          </Box>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '2px solid #000',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          msUserSelect: 'text',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          p: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Chip
            label={getCategoryName(prompt.category)}
            size="small"
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 0,
              fontWeight: 600,
              fontSize: '0.75rem',
              mb: 1,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {prompt.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, maxHeight: '70vh', overflowY: 'auto' }}>
        {/* タグ */}
        {prompt.tags && prompt.tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 2 }}>
            {prompt.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 0,
                  fontSize: '0.7rem',
                  borderColor: '#e0e0e0',
                  mb: 0.5,
                }}
              />
            ))}
          </Stack>
        )}

        {/* 変数入力セクション */}
        {variables.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                変数の設定
              </Typography>
              {showVariableInputs && Object.keys(variableValues).length > 0 && (
                <Button
                  size="small"
                  onClick={handleResetVariables}
                  sx={{
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    color: '#666',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                    },
                  }}
                >
                  リセット
                </Button>
              )}
            </Box>

            {!showVariableInputs ? (
              <Alert severity="info" sx={{ borderRadius: 0, mb: 2 }}>
                このプロンプトには{variables.length}個の変数が含まれています。
                <Button
                  size="small"
                  onClick={() => setShowVariableInputs(true)}
                  sx={{
                    ml: 1,
                    fontSize: '0.75rem',
                    color: '#000',
                    fontWeight: 600,
                  }}
                >
                  変数を設定する
                </Button>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {variables.map((variable) => (
                  <TextField
                    key={variable}
                    label={variable}
                    value={variableValues[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder={`${variable}を入力`}
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
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* プロンプト本文 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {Object.keys(variableValues).length > 0 && variables.every(v => variableValues[v])
              ? '置換後のプロンプト'
              : 'プロンプト'}
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: Object.keys(variableValues).length > 0 ? '#e8f5e9' : '#f5f5f5',
              border: '1px solid #e0e0e0',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            <Typography variant="body2" component="div" sx={{ fontSize: '0.9rem' }}>
              {Object.keys(variableValues).length > 0
                ? highlightVariables(replacedContent)
                : highlightVariables(prompt.content)}
            </Typography>
          </Box>
        </Box>

        {/* 使い方 */}
        {prompt.usage && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                使い方
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {prompt.usage}
              </Typography>
            </Box>
          </>
        )}

        {/* 例示 */}
        {prompt.example && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                例示
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {prompt.example}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid #e0e0e0',
          p: 2,
          gap: 1,
        }}
      >
        {canSave && (
          <IconButton
            onClick={() => onToggleFavorite(prompt.id)}
            sx={{
              color: isFavorite ? '#000' : '#666',
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            {isFavorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        )}
        {canCopy ? (
          <Button
            variant="outlined"
            startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
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
            {copied ? 'コピー完了' : 'コピー'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            disabled
            sx={{
              borderRadius: 0,
              borderColor: '#ccc',
              color: '#999',
              fontWeight: 600,
            }}
          >
            ログインしてコピー
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onClose}
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
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptDetailDialog;
