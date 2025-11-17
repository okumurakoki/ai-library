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
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import type { Article } from '../types';

interface ArticleEditDialogProps {
  open: boolean;
  article: Article | null;
  onClose: () => void;
  onSave: (article: Article) => void;
  onDelete?: (articleId: string) => void;
}

const ArticleEditDialog: React.FC<ArticleEditDialogProps> = ({
  open,
  article,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'news' | 'tips'>('tips');
  const [author, setAuthor] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setCategory(article.category);
      setAuthor(article.author);
      setThumbnail(article.thumbnail || '');
      setIsPublished(article.isPublished);
    } else {
      // 新規作成の場合
      setTitle('');
      setContent('');
      setCategory('tips');
      setAuthor('AI編集部');
      setThumbnail('');
      setIsPublished(false);
    }
  }, [article]);

  const handleSave = () => {
    const savedArticle: Article = {
      id: article?.id || `article-${Date.now()}`,
      title,
      content,
      category,
      author,
      thumbnail: thumbnail || undefined,
      isPublished,
      publishedAt: article?.publishedAt || new Date().toISOString(),
      createdAt: article?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(savedArticle);
    onClose();
  };

  const handleDelete = () => {
    if (article && onDelete && confirm('この記事を削除しますか？')) {
      onDelete(article.id);
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
          {article ? '記事を編集' : '新規記事作成'}
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
              onChange={(e) => setCategory(e.target.value as 'news' | 'tips')}
              sx={{ borderRadius: 0 }}
            >
              <MenuItem value="news">ニュース</MenuItem>
              <MenuItem value="tips">活用法</MenuItem>
            </Select>
          </FormControl>

          {/* 著者 */}
          <TextField
            fullWidth
            label="著者"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* サムネイル */}
          <TextField
            fullWidth
            label="サムネイル画像URL（任意）"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          {/* コンテンツ */}
          <TextField
            fullWidth
            label="記事内容（Markdown形式）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={15}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
            helperText="Markdown形式で記述できます（## 見出し、**太字**、- リストなど）"
          />

          {/* 公開状態 */}
          <FormControlLabel
            control={
              <Switch
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
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
            label="公開状態"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
        {article && onDelete && (
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
          disabled={!title || !content || !author}
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

export default ArticleEditDialog;
