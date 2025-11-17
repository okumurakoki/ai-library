import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { KPIStats, UserActivity, Article, Prompt } from '../types';
import { SAMPLE_PROMPTS } from '../data/prompts';
import { getCategoryName } from '../data/categories';
import PromptGeneratorDialog from '../components/PromptGeneratorDialog';
import ArticleGeneratorDialog from '../components/ArticleGeneratorDialog';
import PromptEditDialog from '../components/PromptEditDialog';
import ArticleEditDialog from '../components/ArticleEditDialog';

// サンプル記事データ
const SAMPLE_ARTICLES: Article[] = [
  {
    id: 'article-001',
    title: 'ChatGPT-4の新機能で業務効率が3倍に！実践活用法',
    content: '最新のChatGPT-4では、より高度な文脈理解と長文生成が可能になりました...',
    category: 'news',
    author: 'AI Library編集部',
    publishedAt: '2025-01-15T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-002',
    title: 'プロンプトエンジニアリングの基礎：効果的な指示の書き方',
    content: 'AIを最大限に活用するためには、適切なプロンプトの設計が不可欠です...',
    category: 'tips',
    author: 'AI Library編集部',
    publishedAt: '2025-01-10T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-003',
    title: 'Google Gemini Pro 1.5の登場：マルチモーダルAIの新時代',
    content: 'Googleが発表したGemini Pro 1.5は、テキスト、画像、音声、動画を統合的に処理...',
    category: 'news',
    author: 'AI Library編集部',
    publishedAt: '2025-01-08T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'article-004',
    title: 'AIプロンプトの変数活用術：テンプレート化で効率アップ',
    content: '同じような作業を繰り返す場合、プロンプトをテンプレート化することで...',
    category: 'tips',
    author: 'AI Library編集部',
    publishedAt: '2025-01-05T10:00:00Z',
    isPublished: true,
  },
];

// サンプルKPIデータ
const SAMPLE_KPI: KPIStats = {
  activeUsers: 1234,
  monthlyRevenue: 1850000,
  promptCopies: 45678,
  newSignups: 156,
  activeUsersChange: 12.5,
  revenueChange: 8.3,
  copiesChange: 23.7,
  signupsChange: -5.2,
};

// サンプル収益データ
const REVENUE_DATA = [
  { month: '7月', revenue: 1200000 },
  { month: '8月', revenue: 1350000 },
  { month: '9月', revenue: 1500000 },
  { month: '10月', revenue: 1650000 },
  { month: '11月', revenue: 1750000 },
  { month: '12月', revenue: 1850000 },
];

// サンプルカテゴリ別人気度データ
const CATEGORY_DATA = [
  { category: 'マーケティング', count: 856 },
  { category: '営業', count: 742 },
  { category: 'IT・エンジニアリング', count: 698 },
  { category: '人事・採用', count: 534 },
  { category: '経理・会計', count: 478 },
  { category: 'カスタマーサポート', count: 423 },
];

// サンプルユーザーアクティビティデータ
const USER_ACTIVITY: UserActivity[] = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    lastAccess: '2025-01-15 14:30',
    plan: 'premium',
    status: 'active',
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    lastAccess: '2025-01-15 13:15',
    plan: 'premium',
    status: 'active',
  },
  {
    id: '3',
    name: '鈴木一郎',
    email: 'suzuki@example.com',
    lastAccess: '2025-01-14 18:45',
    plan: 'free',
    status: 'active',
  },
  {
    id: '4',
    name: '田中美咲',
    email: 'tanaka@example.com',
    lastAccess: '2025-01-14 09:20',
    plan: 'premium',
    status: 'active',
  },
  {
    id: '5',
    name: '伊藤健太',
    email: 'ito@example.com',
    lastAccess: '2025-01-13 16:30',
    plan: 'free',
    status: 'active',
  },
];

const AdminPanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false);
  const [articleGeneratorDialogOpen, setArticleGeneratorDialogOpen] = useState(false);
  const [editPromptDialogOpen, setEditPromptDialogOpen] = useState(false);
  const [editArticleDialogOpen, setEditArticleDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>(SAMPLE_PROMPTS);
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES);

  const handleGeneratePrompts = (newPrompts: Prompt[]) => {
    setPrompts([...prompts, ...newPrompts]);
    alert(`${newPrompts.length}件のプロンプトを追加しました`);
  };

  const handleGenerateArticle = (newArticle: Article) => {
    setArticles([newArticle, ...articles]);
    alert('記事を追加しました');
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditPromptDialogOpen(true);
  };

  const handleSavePrompt = (updatedPrompt: Prompt) => {
    const existingIndex = prompts.findIndex((p) => p.id === updatedPrompt.id);
    if (existingIndex >= 0) {
      // 編集
      const newPrompts = [...prompts];
      newPrompts[existingIndex] = updatedPrompt;
      setPrompts(newPrompts);
      alert('プロンプトを更新しました');
    } else {
      // 新規作成
      setPrompts([updatedPrompt, ...prompts]);
      alert('プロンプトを作成しました');
    }
  };

  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter((p) => p.id !== promptId));
    alert('プロンプトを削除しました');
  };

  const handleToggleArticlePublish = (articleId: string) => {
    setArticles(
      articles.map((a) =>
        a.id === articleId ? { ...a, isPublished: !a.isPublished } : a
      )
    );
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles(articles.filter((a) => a.id !== articleId));
    alert('記事を削除しました');
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditArticleDialogOpen(true);
  };

  const handleSaveArticle = (updatedArticle: Article) => {
    const existingIndex = articles.findIndex((a) => a.id === updatedArticle.id);
    if (existingIndex >= 0) {
      // 編集
      const newArticles = [...articles];
      newArticles[existingIndex] = updatedArticle;
      setArticles(newArticles);
      alert('記事を更新しました');
    } else {
      // 新規作成
      setArticles([updatedArticle, ...articles]);
      alert('記事を作成しました');
    }
  };

  const KPICard: React.FC<{
    title: string;
    value: string | number;
    change: number;
  }> = ({ title, value, change }) => (
    <Card
      sx={{
        border: '2px solid #000',
        borderRadius: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ color: '#666', mb: 1, fontSize: '0.85rem' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {change > 0 ? (
            <TrendingUpIcon sx={{ color: '#2e7d32', mr: 0.5, fontSize: 20 }} />
          ) : (
            <TrendingDownIcon sx={{ color: '#d32f2f', mr: 0.5, fontSize: 20 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: change > 0 ? '#2e7d32' : '#d32f2f',
              fontWeight: 600,
            }}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          管理者パネル
        </Typography>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{
          borderBottom: '2px solid #000',
          mb: 4,
          px: 2,
          '& .MuiTab-root': {
            fontWeight: 600,
            fontSize: '1rem',
            '&.Mui-selected': {
              color: '#000',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#000',
            height: 3,
          },
        }}
      >
        <Tab label="分析ダッシュボード" />
        <Tab label="プロンプト管理" />
        <Tab label="記事管理" />
      </Tabs>

      {/* 分析ダッシュボードタブ */}
      {selectedTab === 0 && (
        <Box>
          {/* KPI統計カード */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
              mb: 4,
              px: 2,
            }}
          >
            <KPICard
              title="アクティブユーザー数"
              value={SAMPLE_KPI.activeUsers.toLocaleString()}
              change={SAMPLE_KPI.activeUsersChange}
            />
            <KPICard
              title="月間収益"
              value={`¥${SAMPLE_KPI.monthlyRevenue.toLocaleString()}`}
              change={SAMPLE_KPI.revenueChange}
            />
            <KPICard
              title="プロンプトコピー数"
              value={SAMPLE_KPI.promptCopies.toLocaleString()}
              change={SAMPLE_KPI.copiesChange}
            />
            <KPICard
              title="新規登録数"
              value={SAMPLE_KPI.newSignups}
              change={SAMPLE_KPI.signupsChange}
            />
          </Box>

          {/* グラフセクション */}
          <Box sx={{ mb: 4, px: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 月間収益グラフ */}
            <Paper
              sx={{
                p: 1.5,
                border: '2px solid #000',
                borderRadius: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                月間収益推移
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000"
                    strokeWidth={2}
                    name="収益"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* カテゴリ別人気度グラフ */}
            <Paper
              sx={{
                p: 1.5,
                border: '2px solid #000',
                borderRadius: 0,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                カテゴリ別コピー数
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={CATEGORY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#000" name="コピー数" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* ユーザーアクティビティテーブル */}
          <Paper
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
              mx: 2,
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                最近のユーザーアクティビティ
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ユーザー名</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>メール</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>最終アクセス</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>プラン</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ステータス</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {USER_ACTIVITY.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.lastAccess}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            backgroundColor: user.plan === 'premium' ? '#000' : '#666',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {user.plan === 'premium' ? 'プレミアム' : '無料'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            backgroundColor: user.status === 'active' ? '#2e7d32' : '#d32f2f',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {user.status === 'active' ? 'アクティブ' : '非アクティブ'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* プロンプト管理タブ */}
      {selectedTab === 1 && (
        <Box sx={{ px: 2 }}>
          {/* ヘッダーと新規作成ボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              プロンプト一覧
            </Typography>
            <Button
              variant="contained"
              onClick={() => setGeneratorDialogOpen(true)}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              AIプロンプト生成
            </Button>
          </Box>

          {/* 検索とフィルター */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="プロンプトを検索..."
              size="small"
              InputProps={{
                sx: {
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
                },
              }}
            />
          </Box>

          {/* プロンプトテーブル */}
          <TableContainer
            component={Paper}
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>タイトル</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>カテゴリ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>タイプ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>更新日</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prompts.slice(0, 10).map((prompt) => (
                  <TableRow
                    key={prompt.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.85rem' }}>{prompt.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{prompt.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryName(prompt.category)}
                        size="small"
                        sx={{
                          backgroundColor: '#f0f0f0',
                          borderRadius: 0,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prompt.isPremium ? 'プレミアム' : '無料'}
                        size="small"
                        sx={{
                          backgroundColor: prompt.isPremium ? '#000' : '#999',
                          color: '#fff',
                          borderRadius: 0,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {new Date(prompt.updatedAt).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditPrompt(prompt)}
                          sx={{
                            borderColor: '#000',
                            color: '#000',
                            borderRadius: 0,
                            minWidth: 'auto',
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#000',
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          編集
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            if (confirm('このプロンプトを削除しますか？')) {
                              handleDeletePrompt(prompt.id);
                            }
                          }}
                          sx={{
                            borderColor: '#d32f2f',
                            color: '#d32f2f',
                            borderRadius: 0,
                            minWidth: 'auto',
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: '#fff5f5',
                            },
                          }}
                        >
                          削除
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* プロンプト生成ダイアログ */}
          <PromptGeneratorDialog
            open={generatorDialogOpen}
            onClose={() => setGeneratorDialogOpen(false)}
            onGenerate={handleGeneratePrompts}
          />
        </Box>
      )}

      {/* 記事管理タブ */}
      {selectedTab === 2 && (
        <Box sx={{ px: 2 }}>
          {/* ヘッダーと新規作成ボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              記事一覧
            </Typography>
            <Button
              variant="contained"
              onClick={() => setArticleGeneratorDialogOpen(true)}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              AI記事生成
            </Button>
          </Box>

          {/* 検索とフィルター */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="記事を検索..."
              size="small"
              InputProps={{
                sx: {
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
                },
              }}
            />
          </Box>

          {/* 記事テーブル */}
          <TableContainer
            component={Paper}
            sx={{
              border: '2px solid #000',
              borderRadius: 0,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>タイトル</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>カテゴリ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>公開状態</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>公開日</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow
                    key={article.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.85rem' }}>{article.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{article.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={article.category === 'news' ? 'AIニュース' : '使い方記事'}
                        size="small"
                        sx={{
                          backgroundColor: article.category === 'news' ? '#000' : '#666',
                          color: '#fff',
                          borderRadius: 0,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.isPublished ? '公開中' : '非公開'}
                        size="small"
                        sx={{
                          backgroundColor: article.isPublished ? '#2e7d32' : '#999',
                          color: '#fff',
                          borderRadius: 0,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleToggleArticlePublish(article.id)}
                          sx={{
                            borderColor: article.isPublished ? '#999' : '#2e7d32',
                            color: article.isPublished ? '#999' : '#2e7d32',
                            borderRadius: 0,
                            minWidth: 'auto',
                            px: 1.5,
                            fontSize: '0.75rem',
                            '&:hover': {
                              borderColor: article.isPublished ? '#999' : '#2e7d32',
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          {article.isPublished ? '非公開' : '公開'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditArticle(article)}
                          sx={{
                            borderColor: '#000',
                            color: '#000',
                            borderRadius: 0,
                            minWidth: 'auto',
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#000',
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          編集
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            if (confirm('この記事を削除しますか？')) {
                              handleDeleteArticle(article.id);
                            }
                          }}
                          sx={{
                            borderColor: '#d32f2f',
                            color: '#d32f2f',
                            borderRadius: 0,
                            minWidth: 'auto',
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: '#fff5f5',
                            },
                          }}
                        >
                          削除
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* プロンプト生成ダイアログ */}
          <PromptGeneratorDialog
            open={generatorDialogOpen}
            onClose={() => setGeneratorDialogOpen(false)}
            onGenerate={handleGeneratePrompts}
          />

          {/* プロンプト編集ダイアログ */}
          <PromptEditDialog
            open={editPromptDialogOpen}
            prompt={selectedPrompt}
            onClose={() => {
              setEditPromptDialogOpen(false);
              setSelectedPrompt(null);
            }}
            onSave={handleSavePrompt}
            onDelete={handleDeletePrompt}
          />

          {/* 記事生成ダイアログ */}
          <ArticleGeneratorDialog
            open={articleGeneratorDialogOpen}
            onClose={() => setArticleGeneratorDialogOpen(false)}
            onGenerate={handleGenerateArticle}
          />

          {/* 記事編集ダイアログ */}
          <ArticleEditDialog
            open={editArticleDialogOpen}
            article={selectedArticle}
            onClose={() => {
              setEditArticleDialogOpen(false);
              setSelectedArticle(null);
            }}
            onSave={handleSaveArticle}
            onDelete={handleDeleteArticle}
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminPanel;
