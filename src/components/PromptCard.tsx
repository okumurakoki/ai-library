import React, { useState } from 'react';
import {
  Card,
  Typography,
  Chip,
  IconButton,
  Button,
  Box,
  Stack,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Prompt } from '../types';
import { getCategoryName } from '../data/categories';

interface PromptCardProps {
  prompt: Prompt;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  canCopy?: boolean;
  canSave?: boolean;
  isCustomPrompt?: boolean;
  onToggleFavorite: (promptId: string) => void;
  onOpenDetail: (prompt: Prompt) => void;
  onAddToFolder?: (prompt: Prompt) => void;
  onCopy: (promptId: string) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (promptId: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  viewMode,
  isFavorite,
  canCopy = true,
  canSave = true,
  isCustomPrompt = false,
  onToggleFavorite,
  onOpenDetail,
  onAddToFolder,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    onCopy(prompt.id); // 使用履歴を記録
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm('このプロンプトを削除してもよろしいですか？')) {
      onDelete?.(prompt.id);
    }
  };

  // プロンプト内の変数をハイライト表示
  const highlightVariables = (text: string) => {
    const parts = text.split(/(\[.*?\]|\$\{.*?\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\[.*?\]$/) || part.match(/^\$\{.*?\}$/)) {
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
    <Card
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 0,
        minHeight: viewMode === 'list' ? 'auto' : 500,
        display: 'flex',
        flexDirection: viewMode === 'list' ? { xs: 'column', md: 'row' } : 'column',
        gap: viewMode === 'list' ? { xs: 2, md: 3 } : 0,
        backgroundColor: viewMode === 'list' ? '#fafafa' : '#fff',
        '&:hover': {
          borderColor: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.2s',
      }}
    >
      {/* 左側（グリッド表示では上部）: メタ情報 */}
      <Box
        sx={{
          width: viewMode === 'list' ? { xs: '100%', md: '40%' } : '100%',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* カテゴリバッジ */}
        <Chip
          label={getCategoryName(prompt.category)}
          size="small"
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: 0,
            fontWeight: 600,
            fontSize: '0.75rem',
            alignSelf: 'flex-start',
          }}
        />

        {/* タイトル */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            lineHeight: 1.3,
          }}
        >
          {prompt.title}
        </Typography>

        {/* タグ */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
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
                backgroundColor: '#fff',
                mb: 0.5,
              }}
            />
          ))}
        </Stack>

        {/* アクションボタン（グリッド表示時は下部に配置） */}
        {viewMode === 'grid' && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {isCustomPrompt ? (
                <>
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(prompt)}
                    sx={{
                      color: '#666',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                    title="編集"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': { backgroundColor: '#ffebee' },
                    }}
                    title="削除"
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  {canSave && (
                    <IconButton
                      size="small"
                      onClick={() => onToggleFavorite(prompt.id)}
                      sx={{
                        color: isFavorite ? '#000' : '#666',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    >
                      {isFavorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  )}
                  {onAddToFolder && canSave && (
                    <IconButton
                      size="small"
                      onClick={() => onAddToFolder(prompt)}
                      sx={{
                        color: '#666',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                      title="フォルダに追加"
                    >
                      <CreateNewFolderIcon />
                    </IconButton>
                  )}
                </>
              )}
              {canCopy ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    borderRadius: 0,
                    borderColor: '#000',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '0.8rem',
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
                  size="small"
                  disabled
                  sx={{
                    borderRadius: 0,
                    borderColor: '#ccc',
                    color: '#999',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  ログインしてコピー
                </Button>
              )}
              {canCopy ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    console.log('Detail button clicked (grid):', prompt.id, prompt.title);
                    onOpenDetail(prompt);
                  }}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  詳細
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  disabled
                  sx={{
                    borderRadius: 0,
                    backgroundColor: '#999',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  ログインして詳細を見る
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      {/* 右側（グリッド表示では下部）: プロンプト内容 */}
      <Box
        sx={{
          width: viewMode === 'list' ? { xs: '100%', md: '60%' } : '100%',
          p: 2,
          borderTop: viewMode === 'grid' ? '1px solid #e0e0e0' : 'none',
          borderLeft: viewMode === 'list' ? { xs: 'none', md: '1px solid #e0e0e0' } : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {/* プロンプト本文 */}
        <Box
          sx={{
            maxHeight: viewMode === 'list' ? { xs: 150, md: 250 } : 200,
            overflowY: 'auto',
            p: 1.5,
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          <Typography variant="body2" component="div" sx={{ fontSize: '0.85rem' }}>
            {highlightVariables(prompt.content)}
          </Typography>
        </Box>

        {/* リスト表示時のアクションボタン */}
        {viewMode === 'list' && (
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            {isCustomPrompt ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(prompt)}
                  sx={{
                    color: '#666',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                  title="編集"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    color: '#d32f2f',
                    '&:hover': { backgroundColor: '#ffebee' },
                  }}
                  title="削除"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              <>
                {canSave && (
                  <IconButton
                    size="small"
                    onClick={() => onToggleFavorite(prompt.id)}
                    sx={{
                      color: isFavorite ? '#000' : '#666',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                  >
                    {isFavorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                )}
                {onAddToFolder && canSave && (
                  <IconButton
                    size="small"
                    onClick={() => onAddToFolder(prompt)}
                    sx={{
                      color: '#666',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                    title="フォルダに追加"
                  >
                    <CreateNewFolderIcon />
                  </IconButton>
                )}
              </>
            )}
            {canCopy ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={handleCopy}
                sx={{
                  borderRadius: 0,
                  borderColor: '#000',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '0.8rem',
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
                size="small"
                disabled
                sx={{
                  borderRadius: 0,
                  borderColor: '#ccc',
                  color: '#999',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                ログインしてコピー
              </Button>
            )}
            {canCopy ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  console.log('Detail button clicked (list):', prompt.id, prompt.title);
                  onOpenDetail(prompt);
                }}
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#000',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
              >
                詳細
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                disabled
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#999',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                ログインして詳細を見る
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Card>
  );
};

export default PromptCard;
