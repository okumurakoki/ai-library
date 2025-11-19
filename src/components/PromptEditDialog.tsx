import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { CATEGORIES } from '../data/categories';
import type { Prompt } from '../types';

interface PromptEditDialogProps {
  open: boolean;
  prompt: Prompt | null;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  onDelete?: (promptId: string) => void;
}

const USE_CASES = [
  { id: 'writing', label: '文章作成' },
  { id: 'analysis', label: 'データ分析' },
  { id: 'communication', label: 'コミュニケーション' },
  { id: 'planning', label: '企画・計画' },
  { id: 'research', label: 'リサーチ' },
  { id: 'creative', label: 'クリエイティブ' },
  { id: 'automation', label: '業務自動化' },
  { id: 'learning', label: '学習・教育' },
];

const PromptEditDialog: React.FC<PromptEditDialogProps> = ({
  open,
  prompt,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [usage, setUsage] = useState('');
  const [example, setExample] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategory(prompt.category);
      setSelectedUseCases(prompt.useCase || []);
      setTags(prompt.tags || []);
      setUsage(prompt.usage || '');
      setExample(prompt.example || '');
      setIsPremium(prompt.isPremium || false);
    } else {
      // 新規作成の場合
      setTitle('');
      setContent('');
      setCategory('');
      setSelectedUseCases([]);
      setTags([]);
      setUsage('');
      setExample('');
      setIsPremium(false);
    }
  }, [prompt]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleToggleUseCase = (useCaseId: string) => {
    if (selectedUseCases.includes(useCaseId)) {
      setSelectedUseCases(selectedUseCases.filter((uc) => uc !== useCaseId));
    } else {
      setSelectedUseCases([...selectedUseCases, useCaseId]);
    }
  };

  const handleSave = () => {
    const savedPrompt: Prompt = {
      id: prompt?.id || `prompt-${Date.now()}`,
      title,
      content,
      category,
      useCase: selectedUseCases,
      tags,
      usage,
      example,
      isPremium,
      createdAt: prompt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(savedPrompt);
    onClose();
  };

  const handleDelete = () => {
    if (prompt && onDelete && confirm('このプロンプトを削除しますか？')) {
      onDelete(prompt.id);
      onClose();
    }
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
          {prompt ? 'プロンプトを編集' : '新規プロンプト作成'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* タイトル */}
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* カテゴリ */}
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={category}
              label="カテゴリ"
              onChange={(e) => setCategory(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 用途カテゴリ */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              用途カテゴリ（複数選択可）
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {USE_CASES.map((useCase) => (
                <Chip
                  key={useCase.id}
                  label={useCase.label}
                  onClick={() => handleToggleUseCase(useCase.id)}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: selectedUseCases.includes(useCase.id) ? '#000' : '#fff',
                    color: selectedUseCases.includes(useCase.id) ? '#fff' : '#000',
                    border: '1px solid #000',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedUseCases.includes(useCase.id) ? '#333' : '#f5f5f5',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* タグ */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              タグ
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="タグを入力"
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                startIcon={<AddIcon />}
                sx={{ borderRadius: 0, borderColor: '#000', color: '#000' }}
              >
                追加
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ borderRadius: 0 }}
                />
              ))}
            </Box>
          </Box>

          {/* コンテンツ */}
          <TextField
            fullWidth
            label="プロンプト内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={10}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* 使い方 */}
          <TextField
            fullWidth
            label="使い方（任意）"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* 例 */}
          <TextField
            fullWidth
            label="例（任意）"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* プレミアム */}
          <FormControlLabel
            control={
              <Switch
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#000',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#000',
                  },
                }}
              />
            }
            label="プレミアムプロンプト"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        {prompt && onDelete && (
          <Button
            onClick={handleDelete}
            sx={{
              mr: 'auto',
              color: '#d32f2f',
              borderColor: '#d32f2f',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: '#fff5f5',
              },
            }}
            variant="outlined"
          >
            削除
          </Button>
        )}
        <Button onClick={onClose} sx={{ borderRadius: 0, color: '#666' }}>
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!title || !content || !category}
          sx={{
            borderRadius: 0,
            backgroundColor: '#000',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptEditDialog;
