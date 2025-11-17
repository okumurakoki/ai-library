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
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { CATEGORIES } from '../data/categories';
import type { Prompt } from '../types';
import { generateHighQualityPrompts, calculatePromptQuality } from '../utils/promptGenerator';

interface PromptGeneratorDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompts: Prompt[]) => void;
}

const PromptGeneratorDialog: React.FC<PromptGeneratorDialogProps> = ({
  open,
  onClose,
  onGenerate,
}) => {
  const [category, setCategory] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!category || !businessContext) {
      setError('カテゴリと業務内容を入力してください');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const prompts = await generateHighQualityPrompts(category, businessContext, count);
      setGeneratedPrompts(prompts);
    } catch (err) {
      setError('プロンプトの生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleAdd = () => {
    onGenerate(generatedPrompts);
    handleClose();
  };

  const handleClose = () => {
    setCategory('');
    setBusinessContext('');
    setCount(5);
    setGeneratedPrompts([]);
    setError('');
    onClose();
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
          AIプロンプト生成
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

        {generatedPrompts.length === 0 ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              カテゴリと業務内容を入力して、AIが自動的にプロンプトを生成します。
            </Typography>

            {/* カテゴリ選択 */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={category}
                label="カテゴリ"
                onChange={(e) => setCategory(e.target.value)}
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
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 業務内容 */}
            <TextField
              fullWidth
              label="業務内容・キーワード"
              placeholder="例: 物件紹介、顧客対応、契約書レビュー"
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              multiline
              rows={3}
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

            {/* 生成件数 */}
            <TextField
              fullWidth
              type="number"
              label="生成件数"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 50 }}
              helperText="1〜50件まで指定できます"
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
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {generatedPrompts.length}件のプロンプトを生成しました
              </Typography>
              <Chip
                label="プレビュー"
                size="small"
                sx={{ backgroundColor: '#f0f0f0', borderRadius: 0 }}
              />
            </Box>

            <Box
              sx={{
                maxHeight: 400,
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                p: 2,
              }}
            >
              {generatedPrompts.map((prompt, index) => {
                const qualityScore = calculatePromptQuality(prompt);
                const qualityColor =
                  qualityScore >= 80 ? '#2e7d32' : qualityScore >= 60 ? '#f57c00' : '#d32f2f';

                return (
                  <Box
                    key={prompt.id}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: index < generatedPrompts.length - 1 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                        {index + 1}. {prompt.title}
                      </Typography>
                      <Chip
                        label={`品質: ${qualityScore}点`}
                        size="small"
                        sx={{
                          backgroundColor: qualityColor,
                          color: '#fff',
                          borderRadius: 0,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      />
                      {prompt.isPremium && (
                        <Chip
                          label="プレミアム"
                          size="small"
                          sx={{
                            backgroundColor: '#000',
                            color: '#fff',
                            borderRadius: 0,
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        maxHeight: 100,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: 0.5,
                      }}
                    >
                      {prompt.content}
                    </Typography>
                    {prompt.tags && prompt.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {prompt.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: '#f0f0f0',
                              borderRadius: 0,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
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

        {generatedPrompts.length === 0 ? (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating || !category || !businessContext}
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
            {generating ? '生成中...' : 'プロンプト生成'}
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setGeneratedPrompts([]);
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
              すべて追加
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PromptGeneratorDialog;
