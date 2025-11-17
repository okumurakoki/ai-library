import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import type { Article } from '../types';

// サンプル記事データ
const SAMPLE_ARTICLES: Article[] = [
  {
    id: 'article-001',
    title: 'ChatGPT-4の新機能で業務効率が3倍に！実践活用法',
    content: `最新のChatGPT-4では、より高度な文脈理解と長文生成が可能になりました。本記事では、実際のビジネスシーンでの活用事例を紹介します。

【主な新機能】
1. 長文コンテキストの理解
2. より正確な業界用語の理解
3. 複雑な指示への対応力向上

【実践例】
- 営業提案書の下書き作成: 従来の3倍の速度で作成可能
- 契約書のレビュー: 重要条項の抽出が正確に
- カスタマーサポート: より自然な応答が可能に

これらの機能を活用することで、業務時間を大幅に削減できます。`,
    category: 'news',
    author: 'AI Library編集部',
    publishedAt: '2025-01-15T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-002',
    title: 'プロンプトエンジニアリングの基礎：効果的な指示の書き方',
    content: `AIを最大限に活用するためには、適切なプロンプトの設計が不可欠です。本記事では、効果的なプロンプトの書き方を解説します。

【基本原則】
1. 明確で具体的な指示
2. 文脈情報の提供
3. 期待する出力形式の指定
4. 例示の活用

【良いプロンプトの例】
❌ 悪い例: "メールを書いて"
✅ 良い例: "新規顧客への初回アプローチメールを、フォーマルなトーンで200文字程度で作成してください。商品は法人向けSaaSツールです。"

【ステップバイステップの指示】
複雑なタスクは、複数のステップに分けて指示することで、より正確な結果が得られます。

【出力形式の指定】
"箇条書きで"、"JSON形式で"など、具体的な形式を指定することで、後処理が容易になります。`,
    category: 'tips',
    author: 'AI Library編集部',
    publishedAt: '2025-01-10T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-003',
    title: 'Google Gemini Pro 1.5の登場：マルチモーダルAIの新時代',
    content: `Googleが発表したGemini Pro 1.5は、テキスト、画像、音声、動画を統合的に処理できる画期的なAIモデルです。

【主な特徴】
1. 100万トークンのコンテキスト長
2. マルチモーダル処理
3. より高速な推論
4. コスト効率の向上

【ビジネス活用例】
- 動画コンテンツの自動要約
- 画像からのデータ抽出
- 音声会議の議事録作成
- 複数ドキュメントの横断分析

特に、長文ドキュメントの分析においては、従来モデルを大きく上回る性能を発揮します。`,
    category: 'news',
    author: 'AI Library編集部',
    publishedAt: '2025-01-08T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-004',
    title: 'AIプロンプトの変数活用術：テンプレート化で効率アップ',
    content: `同じような作業を繰り返す場合、プロンプトをテンプレート化することで大幅な効率化が可能です。

【変数の基本的な使い方】
プロンプト内で変更する部分を[変数名]や\${変数}として記述することで、再利用しやすくなります。

【実践例1: メール作成】
"[顧客名]様

お世話になっております。[会社名]の[担当者名]です。

[本文内容]

何かご不明点がございましたら、お気軽にお問い合わせください。"

【実践例2: 商品説明】
"商品名: [商品名]
特徴: [特徴1], [特徴2], [特徴3]
価格: [価格]円
ターゲット: [ターゲット層]"

【テンプレート管理のコツ】
1. 頻繁に使用するプロンプトを保存
2. カテゴリごとに整理
3. 変数部分を明確にマーク
4. 定期的に見直しと改善

このテクニックを活用することで、日々の業務効率が大幅に向上します。`,
    category: 'tips',
    author: 'AI Library編集部',
    publishedAt: '2025-01-05T10:00:00Z',
    isPublished: true,
  },
];

const Articles: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'news' | 'tips'>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredArticles =
    categoryFilter === 'all'
      ? SAMPLE_ARTICLES
      : SAMPLE_ARTICLES.filter((a) => a.category === categoryFilter);

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    setDialogOpen(true);
  };

  const handleCloseArticle = () => {
    setDialogOpen(false);
    setSelectedArticle(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            記事・ニュース
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            AIの最新情報と使い方のヒント
          </Typography>
        </Box>
      </Box>

      {/* カテゴリフィルター */}
      <Box sx={{ mb: 4, height: 42 }}>
        <ToggleButtonGroup
          value={categoryFilter}
          exclusive
          onChange={(_, newFilter) => {
            if (newFilter !== null) {
              setCategoryFilter(newFilter);
            }
          }}
          sx={{
            height: 42,
            '& .MuiToggleButton-root': {
              borderRadius: 0,
              borderColor: '#e0e0e0',
              color: '#666',
              px: 3,
              height: 42,
              minWidth: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&.Mui-selected': {
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                },
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            },
          }}
        >
          <ToggleButton value="all">すべて</ToggleButton>
          <ToggleButton value="news">AIニュース</ToggleButton>
          <ToggleButton value="tips">使い方記事</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 記事一覧 */}
      <Grid container spacing={3}>
        {filteredArticles.map((article) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={article.id}>
            <Card
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 0,
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s',
              }}
            >
              <CardActionArea onClick={() => handleOpenArticle(article)}>
                <CardContent sx={{ p: 3 }}>
                  <Chip
                    label={article.category === 'news' ? 'AIニュース' : '使い方記事'}
                    size="small"
                    sx={{
                      backgroundColor: article.category === 'news' ? '#000' : '#666',
                      color: '#fff',
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '1rem',
                      lineHeight: 1.4,
                      minHeight: 60,
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6,
                    }}
                  >
                    {article.content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP')} | {article.author}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 記事詳細ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseArticle}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '2px solid #000',
          },
        }}
      >
        {selectedArticle && (
          <>
            <DialogTitle
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #e0e0e0',
                p: 3,
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Chip
                  label={selectedArticle.category === 'news' ? 'AIニュース' : '使い方記事'}
                  size="small"
                  sx={{
                    backgroundColor: selectedArticle.category === 'news' ? '#000' : '#666',
                    color: '#fff',
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    mb: 1,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {selectedArticle.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('ja-JP')} |{' '}
                  {selectedArticle.author}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseArticle} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  color: '#333',
                }}
              >
                {selectedArticle.content}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
              <Button
                variant="contained"
                onClick={handleCloseArticle}
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
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Articles;
