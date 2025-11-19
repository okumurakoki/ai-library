import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  IconButton,
  Typography,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { CATEGORIES } from '../data/categories';
import type { Prompt } from '../types';
import type { UserPermissions } from '../utils/userPermissions';

interface CustomPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingPrompt?: Prompt | null;
  currentPromptCount?: number;
  userPlan?: 'free' | 'premium';
  permissions?: UserPermissions;
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

const CustomPromptDialog: React.FC<CustomPromptDialogProps> = ({
  open,
  onClose,
  onSave,
  editingPrompt,
  currentPromptCount = 0,
  userPlan = 'free',
  permissions,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [usage, setUsage] = useState('');
  const [example, setExample] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // プラン別の上限（permissionsから取得、なければデフォルト値）
  const promptLimit = permissions?.maxCustomPrompts ?? (userPlan === 'premium' ? 150 : 10);
  const isAtLimit = !editingPrompt && promptLimit !== null && currentPromptCount >= promptLimit;

  // 編集モード時に値をセット
  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setContent(editingPrompt.content);
      setCategory(editingPrompt.category);
      setSelectedUseCases(editingPrompt.useCase || []);
      setTags(editingPrompt.tags);
      setUsage(editingPrompt.usage || '');
      setExample(editingPrompt.example || '');
    } else {
      // 新規作成時は初期化
      setTitle('');
      setContent('');
      setCategory('');
      setSelectedUseCases([]);
      setTags([]);
      setTagInput('');
      setUsage('');
      setExample('');
    }
    setErrors({});
  }, [editingPrompt, open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    if (!content.trim()) {
      newErrors.content = 'プロンプト本文を入力してください';
    }
    if (!category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    if (tags.length === 0) {
      newErrors.tags = '少なくとも1つのタグを追加してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave({
      title,
      content,
      category,
      useCase: selectedUseCases,
      tags,
      usage: usage || undefined,
      example: example || undefined,
      isPremium: false,
    });

    onClose();
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
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {editingPrompt ? 'プロンプトを編集' : 'カスタムプロンプトを作成'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* プラン制限の表示 */}
        <Box
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: isAtLimit ? '#ffebee' : '#f5f5f5',
            border: `1px solid ${isAtLimit ? '#ef5350' : '#e0e0e0'}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isAtLimit ? '#c62828' : '#666',
            }}
          >
            {editingPrompt
              ? '編集中のプロンプト'
              : `作成可能数: ${currentPromptCount}/${promptLimit === null ? '無制限' : promptLimit}件 (${userPlan === 'free' ? 'フリープラン' : 'プレミアムプラン'})`}
          </Typography>
          {isAtLimit && (
            <Typography variant="caption" sx={{ color: '#c62828', mt: 0.5, display: 'block' }}>
              プロンプトの作成上限に達しています。プレミアムプランにアップグレードするとより多く作成できます。
            </Typography>
          )}
        </Box>

        <Stack spacing={3}>
          {/* タイトル */}
          <TextField
            label="タイトル *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* カテゴリ */}
          <FormControl
            fullWidth
            error={!!errors.category}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          >
            <InputLabel>カテゴリ *</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} label="カテゴリ *">
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.category}
              </Typography>
            )}
          </FormControl>

          {/* 用途 */}
          <FormControl
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          >
            <InputLabel>用途（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedUseCases}
              onChange={(e) => setSelectedUseCases(e.target.value as string[])}
              label="用途（複数選択可）"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const useCase = USE_CASES.find((uc) => uc.id === value);
                    return <Chip key={value} label={useCase?.label || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {USE_CASES.map((uc) => (
                <MenuItem key={uc.id} value={uc.id}>
                  {uc.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* タグ */}
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="タグを追加 *"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                error={!!errors.tags && tags.length === 0}
                helperText={errors.tags && tags.length === 0 ? errors.tags : ''}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 0,
                  borderColor: '#000',
                  color: '#000',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: '#000',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                追加
              </Button>
            </Box>
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    sx={{ borderRadius: 0 }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* プロンプト本文 */}
          <TextField
            label="プロンプト本文 *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={!!errors.content}
            helperText={errors.content}
            multiline
            rows={6}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                fontFamily: 'monospace',
              },
            }}
          />

          {/* 使い方 */}
          <TextField
            label="使い方（オプション）"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* 例示 */}
          <TextField
            label="例示（オプション）"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid #e0e0e0',
          p: 2,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
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
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isAtLimit}
          sx={{
            borderRadius: 0,
            backgroundColor: '#000',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#333',
            },
            '&.Mui-disabled': {
              backgroundColor: '#ccc',
              color: '#999',
            },
          }}
        >
          {editingPrompt ? '更新' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomPromptDialog;
