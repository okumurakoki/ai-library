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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import type { Article } from '../types';
import { generateArticle } from '../utils/articleGenerator';

interface ArticleGeneratorDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (article: Article) => void;
}

const ArticleGeneratorDialog: React.FC<ArticleGeneratorDialogProps> = ({
  open,
  onClose,
  onGenerate,
}) => {
  const [category, setCategory] = useState<'news' | 'tips'>('news');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [researching, setResearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [researchContext, setResearchContext] = useState('');

  const handleResearch = async () => {
    if (!topic) {
      setError('トピックを入力してリサーチしてください');
      return;
    }

    setResearching(true);
    setError('');

    try {
      const response = await fetch('/api/tavily-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${topic} AI 最新情報`,
        }),
      });

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const data = await response.json();
      setSearchResults(data.results || []);

      // 検索結果をコンテキストとして保存
      const context = data.results
        .map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}`)
        .join('\n\n');
      setResearchContext(context);
    } catch (err) {
      setError('最新情報の取得に失敗しました');
    } finally {
      setResearching(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic) {
      setError('トピックを入力してください');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const keywordArray = keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const article = await generateArticle(category, topic, keywordArray, researchContext);
      setGeneratedArticle(article);
    } catch (err) {
      setError('記事の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleAdd = () => {
    if (generatedArticle) {
      onGenerate(generatedArticle);
      handleClose();
    }
  };

  const handleClose = () => {
    setCategory('news');
    setTopic('');
    setKeywords('');
    setGeneratedArticle(null);
    setError('');
    onClose();
  };

  const handleEditTitle = (newTitle: string) => {
    if (generatedArticle) {
      setGeneratedArticle({ ...generatedArticle, title: newTitle });
    }
  };

  const handleEditContent = (newContent: string) => {
    if (generatedArticle) {
      setGeneratedArticle({ ...generatedArticle, content: newContent });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          AI記事生成
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {!generatedArticle ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              カテゴリとトピックを入力して、AIが自動的に記事を生成します。
            </Typography>

            {/* カテゴリ選択 */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={category}
                label="カテゴリ"
                onChange={(e) => setCategory(e.target.value as 'news' | 'tips')}
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
                <MenuItem value="news">AIニュース</MenuItem>
                <MenuItem value="tips">使い方記事</MenuItem>
              </Select>
            </FormControl>

            {/* トピック */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="トピック・テーマ"
                placeholder="例: ChatGPT-4の新機能、プロンプトエンジニアリングの基礎"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{
                  mb: 1,
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
                variant="outlined"
                size="small"
                onClick={handleResearch}
                disabled={researching || !topic}
                startIcon={researching ? <CircularProgress size={16} /> : <SearchIcon />}
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
                {researching ? 'リサーチ中...' : '最新情報をリサーチ'}
              </Button>
            </Box>

            {/* 検索結果表示 */}
            {searchResults.length > 0 && (
              <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  リサーチ結果（{searchResults.length}件）
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map((result, index) => (
                    <Box key={index} sx={{ mb: 1.5, pb: 1.5, borderBottom: index < searchResults.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {result.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        {result.url}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {result.content?.substring(0, 150)}...
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                  この情報を元に記事を生成します
                </Typography>
              </Box>
            )}

            {/* キーワード */}
            <TextField
              fullWidth
              label="キーワード（カンマ区切り）"
              placeholder="例: 業務効率化, 実践活用, ベストプラクティス"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              helperText="記事に含めたいキーワードをカンマ区切りで入力"
              sx={{
                mb: 2,
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
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                  生成された記事
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  編集モードとプレビューモードを切り替えられます
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 0,
                    borderColor: '#000',
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
                <ToggleButton value="edit">
                  <EditIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  編集
                </ToggleButton>
                <ToggleButton value="preview">
                  <VisibilityIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  プレビュー
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {viewMode === 'edit' ? (
              <>
                {/* タイトル編集 */}
                <TextField
                  fullWidth
                  label="タイトル"
                  value={generatedArticle.title}
                  onChange={(e) => handleEditTitle(e.target.value)}
                  sx={{
                    mb: 2,
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

                {/* 本文編集 */}
                <TextField
                  fullWidth
                  label="本文（マークダウン）"
                  value={generatedArticle.content}
                  onChange={(e) => handleEditContent(e.target.value)}
                  multiline
                  rows={15}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      fontFamily: 'monospace',
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
              </>
            ) : (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  p: 3,
                  maxHeight: 500,
                  overflowY: 'auto',
                  mb: 2,
                  '& h1': { fontSize: '2rem', fontWeight: 700, mt: 2, mb: 2 },
                  '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 3, mb: 1.5, borderBottom: '2px solid #000', pb: 0.5 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                  '& h4': { fontSize: '1.1rem', fontWeight: 600, mt: 1.5, mb: 1 },
                  '& p': { mb: 1.5, lineHeight: 1.8 },
                  '& ul, & ol': { pl: 3, mb: 1.5 },
                  '& li': { mb: 0.5 },
                  '& strong': { fontWeight: 700 },
                  '& code': { backgroundColor: '#f5f5f5', px: 0.5, py: 0.25, borderRadius: '3px', fontFamily: 'monospace' },
                  '& pre': { backgroundColor: '#f5f5f5', p: 2, borderRadius: 0, overflow: 'auto' },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  {generatedArticle.title}
                </Typography>
                <ReactMarkdown>{generatedArticle.content}</ReactMarkdown>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: generatedArticle.category === 'news' ? '#000' : '#666',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {generatedArticle.category === 'news' ? 'AIニュース' : '使い方記事'}
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: '#f0f0f0',
                  fontSize: '0.75rem',
                }}
              >
                文字数: {generatedArticle.content.length}文字
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
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
          キャンセル
        </Button>

        {!generatedArticle ? (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating || !topic}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#333',
              },
              '&:disabled': {
                backgroundColor: '#999',
                color: '#fff',
              },
            }}
          >
            {generating ? '生成中...' : '記事を生成'}
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setGeneratedArticle(null);
                setError('');
              }}
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
              再生成
            </Button>
            <Button
              variant="contained"
              onClick={handleAdd}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              記事を追加
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ArticleGeneratorDialog;
