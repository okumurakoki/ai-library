import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Button,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { Prompt } from '../types';
import { getCategoryName } from '../data/categories';

interface RecommendedSectionProps {
  recommendations: { prompt: Prompt; reasons: string[] }[];
  favorites: string[];
  onToggleFavorite: (promptId: string) => void;
  onOpenDetail: (prompt: Prompt) => void;
  onCopy: (promptId: string) => void;
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  recommendations,
  favorites,
  onToggleFavorite,
  onOpenDetail,
  onCopy,
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  const handleCopy = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content);
    onCopy(prompt.id);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AutoAwesomeIcon sx={{ color: '#000' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          あなたにおすすめのプロンプト
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {recommendations.map(({ prompt, reasons }) => (
          <Card
            key={prompt.id}
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
              backgroundColor: '#fffde7',
              '&:hover': {
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* カテゴリとレコメンド理由 */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip
                  label={getCategoryName(prompt.category)}
                  size="small"
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
                {reasons.slice(0, 2).map((reason, index) => (
                  <Chip
                    key={index}
                    label={reason}
                    size="small"
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 0,
                      fontSize: '0.65rem',
                      height: '20px',
                    }}
                  />
                ))}
              </Stack>

              {/* タイトル */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  lineHeight: 1.3,
                  mb: 1,
                  minHeight: '2.6em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {prompt.title}
              </Typography>

              {/* プロンプトプレビュー */}
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  maxHeight: '60px',
                  overflow: 'hidden',
                  mb: 1.5,
                  fontFamily: 'monospace',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {prompt.content}
                </Typography>
              </Box>

              {/* アクションボタン */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => onToggleFavorite(prompt.id)}
                  sx={{
                    color: favorites.includes(prompt.id) ? '#000' : '#666',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  {favorites.includes(prompt.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(prompt)}
                  sx={{
                    borderRadius: 0,
                    borderColor: '#000',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    '&:hover': {
                      borderColor: '#000',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  コピー
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onOpenDetail(prompt)}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  詳細
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default RecommendedSection;
