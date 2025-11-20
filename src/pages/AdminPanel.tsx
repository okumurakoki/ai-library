import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { KPIStats, Article, Prompt } from '../types';
import { SAMPLE_PROMPTS } from '../data/prompts';
import { getCategoryName } from '../data/categories';
import PromptGeneratorDialog from '../components/PromptGeneratorDialog';
import ArticleGeneratorDialog from '../components/ArticleGeneratorDialog';
import PromptEditDialog from '../components/PromptEditDialog';
import ArticleEditDialog from '../components/ArticleEditDialog';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import {
  fetchAllArticles,
  createArticle,
  updateArticle,
  deleteArticle as deleteArticleFromSupabase,
  fetchPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt as deletePromptFromSupabase,
  getOverallStats,
  getPromptCopyStats,
  getRecentUserActivity,
} from '../lib/supabase';

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

// カテゴリ別人気度データは動的に生成されるため削除
// 収益データ・ユーザーアクティビティデータは実データで取得

const AdminPanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false);
  const [articleGeneratorDialogOpen, setArticleGeneratorDialogOpen] = useState(false);
  const [editPromptDialogOpen, setEditPromptDialogOpen] = useState(false);
  const [editArticleDialogOpen, setEditArticleDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [promptPage, setPromptPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const itemsPerPage = 50;
  const { toast, showSuccess, showError, hideToast } = useToast();

  // 実データKPI
  const [kpiStats, setKpiStats] = useState<KPIStats>(SAMPLE_KPI);
  const [kpiLoading, setKpiLoading] = useState(true);

  // ユーザーアクティビティ
  const [userActivity, setUserActivity] = useState<Array<{
    userId: string;
    lastAccess: Date;
  }>>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // カテゴリ別人気度データを動的に生成
  const categoryData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};

    prompts.forEach((prompt) => {
      const categoryName = getCategoryName(prompt.category);
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // 上位6カテゴリ
  }, [prompts]);

  // Supabaseからプロンプトを取得
  useEffect(() => {
    const loadPrompts = async () => {
      setPromptsLoading(true);
      try {
        const fetchedPrompts = await fetchPrompts();
        if (fetchedPrompts && fetchedPrompts.length > 0) {
          // Supabaseの形式をフロントエンドの形式に変換
          const promptsData = fetchedPrompts.map((p: any) => ({
            ...p,
            useCase: p.use_case,
            isPremium: p.is_premium,
            planType: p.plan_type || (p.is_premium ? 'premium' : 'free'),
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setPrompts(promptsData);
        } else {
          // Supabaseにプロンプトがない場合はサンプルを使用
          setPrompts(SAMPLE_PROMPTS);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
        setPrompts(SAMPLE_PROMPTS);
      } finally {
        setPromptsLoading(false);
      }
    };

    loadPrompts();
  }, []);

  // Supabaseから記事を取得
  useEffect(() => {
    const loadArticles = async () => {
      setArticlesLoading(true);
      try {
        const fetchedArticles = await fetchAllArticles();
        if (fetchedArticles && fetchedArticles.length > 0) {
          // Supabaseの形式をフロントエンドの形式に変換
          const articlesData = fetchedArticles.map((a: any) => ({
            ...a,
            isPublished: a.is_published,
            publishedAt: a.published_at,
            thumbnailUrl: a.thumbnail_url,
          }));
          setArticles(articlesData);
        } else {
          // Supabaseに記事がない場合はサンプル記事を使用
          setArticles(SAMPLE_ARTICLES);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
        setArticles(SAMPLE_ARTICLES);
      } finally {
        setArticlesLoading(false);
      }
    };

    loadArticles();
  }, []);

  // KPI統計をロード
  useEffect(() => {
    const loadKPI = async () => {
      setKpiLoading(true);
      try {
        const stats = await getOverallStats();

        // 今月のコピー数を取得
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const copyLogs = await getPromptCopyStats(monthStart);
        const monthlyPromptCopies = copyLogs.length;

        // 前月のコピー数を取得（変化率計算用）
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthCopyLogs = await getPromptCopyStats(lastMonthStart, lastMonthEnd);
        const lastMonthCopies = lastMonthCopyLogs.length;

        // 変化率を計算
        const copiesChange = lastMonthCopies > 0
          ? ((monthlyPromptCopies - lastMonthCopies) / lastMonthCopies) * 100
          : 0;

        setKpiStats({
          activeUsers: stats.activeUsers,
          monthlyRevenue: 0, // Stripe統合で取得可能
          promptCopies: monthlyPromptCopies,
          newSignups: 0, // Clerk webhookで追跡可能
          activeUsersChange: 0, // 前月比データが必要
          revenueChange: 0,
          copiesChange: Math.round(copiesChange * 10) / 10,
          signupsChange: 0,
        });
      } catch (error) {
        console.error('Error loading KPI stats:', error);
        // エラー時はサンプルデータを使用
        setKpiStats(SAMPLE_KPI);
      } finally {
        setKpiLoading(false);
      }
    };

    loadKPI();
  }, []);

  // ユーザーアクティビティをロード
  useEffect(() => {
    const loadUserActivity = async () => {
      setActivityLoading(true);
      try {
        const activities = await getRecentUserActivity(10);
        setUserActivity(activities);
      } catch (error) {
        console.error('Error loading user activity:', error);
        setUserActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    loadUserActivity();
  }, []);

  const handleGeneratePrompts = async (newPrompts: Prompt[]) => {
    try {
      const createdPrompts = [];

      for (const prompt of newPrompts) {
        const created = await createPrompt({
          id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          category: prompt.category,
          use_case: prompt.useCase,
          tags: prompt.tags,
          usage: prompt.usage,
          example: prompt.example,
          is_premium: prompt.isPremium,
          plan_type: prompt.planType || (prompt.isPremium ? 'premium' : 'free'),
        });

        if (created) {
          // Supabaseの形式をフロントエンドの形式に変換
          const promptForDisplay: Prompt = {
            ...created,
            useCase: created.use_case,
            isPremium: created.is_premium,
            planType: created.plan_type,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
          };
          createdPrompts.push(promptForDisplay);
        }
      }

      setPrompts([...createdPrompts, ...prompts]);
      showSuccess(`${createdPrompts.length}件のプロンプトをSupabaseに保存しました。ホーム画面に反映するには、ホームに移動してページをリロード（F5またはCmd+R）してください。`);
    } catch (error) {
      console.error('Error creating prompts:', error);
      showError('プロンプトの保存に失敗しました');
    }
  };

  const handleGenerateArticle = async (newArticle: Article) => {
    try {
      const created = await createArticle({
        id: newArticle.id,
        title: newArticle.title,
        content: newArticle.content,
        excerpt: newArticle.excerpt,
        category: newArticle.category,
        tags: newArticle.tags,
        author: newArticle.author,
        thumbnail_url: newArticle.thumbnailUrl,
        is_published: newArticle.isPublished || false,
        published_at: newArticle.publishedAt,
      });

      if (created) {
        // Supabaseの形式をフロントエンドの形式に変換
        const articleForDisplay: Article = {
          ...created,
          isPublished: created.is_published,
          publishedAt: created.published_at,
          thumbnailUrl: created.thumbnail_url,
        };
        setArticles([articleForDisplay, ...articles]);
        showSuccess('記事をSupabaseに保存しました');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      showError('記事の保存に失敗しました');
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditPromptDialogOpen(true);
  };

  const handleSavePrompt = async (updatedPrompt: Prompt) => {
    const existingIndex = prompts.findIndex((p) => p.id === updatedPrompt.id);

    try {
      if (existingIndex >= 0) {
        // 編集
        const updated = await updatePrompt(updatedPrompt.id, {
          title: updatedPrompt.title,
          content: updatedPrompt.content,
          category: updatedPrompt.category,
          use_case: updatedPrompt.useCase,
          tags: updatedPrompt.tags,
          usage: updatedPrompt.usage,
          example: updatedPrompt.example,
          is_premium: updatedPrompt.isPremium,
          plan_type: updatedPrompt.planType || (updatedPrompt.isPremium ? 'premium' : 'free'),
        });

        if (updated) {
          const promptForDisplay: Prompt = {
            ...updated,
            useCase: updated.use_case,
            isPremium: updated.is_premium,
            planType: updated.plan_type,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
          };
          const newPrompts = [...prompts];
          newPrompts[existingIndex] = promptForDisplay;
          setPrompts(newPrompts);
          showSuccess('プロンプトを更新しました。ホーム画面に反映するには、ホームに移動してページをリロード（F5またはCmd+R）してください。');
        }
      } else {
        // 新規作成
        const created = await createPrompt({
          id: updatedPrompt.id,
          title: updatedPrompt.title,
          content: updatedPrompt.content,
          category: updatedPrompt.category,
          use_case: updatedPrompt.useCase,
          tags: updatedPrompt.tags,
          usage: updatedPrompt.usage,
          example: updatedPrompt.example,
          is_premium: updatedPrompt.isPremium,
          plan_type: updatedPrompt.planType || (updatedPrompt.isPremium ? 'premium' : 'free'),
        });

        if (created) {
          const promptForDisplay: Prompt = {
            ...created,
            useCase: created.use_case,
            isPremium: created.is_premium,
            planType: created.plan_type,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
          };
          setPrompts([promptForDisplay, ...prompts]);
          showSuccess('プロンプトを作成しました');
        }
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      showError('プロンプトの保存に失敗しました');
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      const success = await deletePromptFromSupabase(promptId);
      if (success) {
        setPrompts(prompts.filter((p) => p.id !== promptId));
        showSuccess('プロンプトを削除しました');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showError('プロンプトの削除に失敗しました');
    }
  };

  const handleToggleArticlePublish = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    try {
      const updated = await updateArticle(articleId, {
        is_published: !article.isPublished,
        published_at: !article.isPublished ? new Date().toISOString() : article.publishedAt,
      });

      if (updated) {
        setArticles(
          articles.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  isPublished: updated.is_published,
                  publishedAt: updated.published_at,
                }
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error toggling article publish status:', error);
      showError('公開状態の変更に失敗しました');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const success = await deleteArticleFromSupabase(articleId);
      if (success) {
        setArticles(articles.filter((a) => a.id !== articleId));
        showSuccess('記事を削除しました');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showError('記事の削除に失敗しました');
    }
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditArticleDialogOpen(true);
  };

  const handleSaveArticle = async (updatedArticle: Article) => {
    const existingIndex = articles.findIndex((a) => a.id === updatedArticle.id);

    try {
      if (existingIndex >= 0) {
        // 編集
        const updated = await updateArticle(updatedArticle.id, {
          title: updatedArticle.title,
          content: updatedArticle.content,
          excerpt: updatedArticle.excerpt,
          category: updatedArticle.category,
          tags: updatedArticle.tags,
          author: updatedArticle.author,
          thumbnail_url: updatedArticle.thumbnailUrl,
          is_published: updatedArticle.isPublished,
          published_at: updatedArticle.publishedAt,
        });

        if (updated) {
          const articleForDisplay: Article = {
            ...updated,
            isPublished: updated.is_published,
            publishedAt: updated.published_at,
            thumbnailUrl: updated.thumbnail_url,
          };
          const newArticles = [...articles];
          newArticles[existingIndex] = articleForDisplay;
          setArticles(newArticles);
          showSuccess('記事を更新しました');
        }
      } else {
        // 新規作成
        const created = await createArticle({
          id: updatedArticle.id,
          title: updatedArticle.title,
          content: updatedArticle.content,
          excerpt: updatedArticle.excerpt,
          category: updatedArticle.category,
          tags: updatedArticle.tags,
          author: updatedArticle.author,
          thumbnail_url: updatedArticle.thumbnailUrl,
          is_published: updatedArticle.isPublished || false,
          published_at: updatedArticle.publishedAt,
        });

        if (created) {
          const articleForDisplay: Article = {
            ...created,
            isPublished: created.is_published,
            publishedAt: created.published_at,
            thumbnailUrl: created.thumbnail_url,
          };
          setArticles([articleForDisplay, ...articles]);
          showSuccess('記事を作成しました');
        }
      }
    } catch (error) {
      console.error('Error saving article:', error);
      showError('記事の保存に失敗しました');
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
            {kpiLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <KPICard
                  title="アクティブユーザー数"
                  value={kpiStats.activeUsers.toLocaleString()}
                  change={kpiStats.activeUsersChange}
                />
                <KPICard
                  title="月間収益"
                  value={`¥${kpiStats.monthlyRevenue.toLocaleString()}`}
                  change={kpiStats.revenueChange}
                />
                <KPICard
                  title="プロンプトコピー数"
                  value={kpiStats.promptCopies.toLocaleString()}
                  change={kpiStats.copiesChange}
                />
                <KPICard
                  title="新規登録数"
                  value={kpiStats.newSignups}
                  change={kpiStats.signupsChange}
                />
              </>
            )}
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Typography variant="body1" sx={{ color: '#666' }}>
                  収益データは現在利用できません（Stripe連携が必要です）
                </Typography>
              </Box>
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
                <BarChart data={categoryData}>
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
                    <TableCell sx={{ fontWeight: 600 }}>ユーザーID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>最終アクセス</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ステータス</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : userActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" sx={{ color: '#666', py: 2 }}>
                          ユーザーアクティビティがありません
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    userActivity.map((activity) => {
                      const lastAccessDate = new Date(activity.lastAccess);
                      const now = new Date();
                      const hoursDiff = (now.getTime() - lastAccessDate.getTime()) / (1000 * 60 * 60);
                      const isRecent = hoursDiff < 24;

                      return (
                        <TableRow key={activity.userId}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                              }}
                            >
                              {activity.userId.substring(0, 12)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {lastAccessDate.toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              sx={{
                                px: 1,
                                py: 0.5,
                                backgroundColor: isRecent ? '#2e7d32' : '#666',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {isRecent ? 'アクティブ' : '非アクティブ'}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* プロンプト管理タブ */}
      {selectedTab === 1 && (
        <Box sx={{ px: 2 }}>
          {promptsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
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
                {prompts
                  .slice((promptPage - 1) * itemsPerPage, promptPage * itemsPerPage)
                  .map((prompt) => (
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
                        label={
                          (prompt.planType || (prompt.isPremium ? 'premium' : 'free')) === 'free' ? '無料' :
                          (prompt.planType || (prompt.isPremium ? 'premium' : 'free')) === 'standard' ? 'スタンダード' :
                          'プレミアム'
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            (prompt.planType || (prompt.isPremium ? 'premium' : 'free')) === 'free' ? '#2e7d32' :
                            (prompt.planType || (prompt.isPremium ? 'premium' : 'free')) === 'standard' ? '#1976d2' :
                            '#000',
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

          {/* ページネーション */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(prompts.length / itemsPerPage)}
              page={promptPage}
              onChange={(_, page) => setPromptPage(page)}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 0,
                  '&.Mui-selected': {
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  },
                },
              }}
            />
          </Box>

          {/* プロンプト生成ダイアログ */}
          <PromptGeneratorDialog
            open={generatorDialogOpen}
            onClose={() => setGeneratorDialogOpen(false)}
            onGenerate={handleGeneratePrompts}
          />
            </>
          )}
        </Box>
      )}

      {/* 記事管理タブ */}
      {selectedTab === 2 && (
        <Box sx={{ px: 2 }}>
          {articlesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
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
                {articles
                  .slice((articlePage - 1) * itemsPerPage, articlePage * itemsPerPage)
                  .map((article) => (
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
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('ja-JP')
                        : '未設定'}
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

          {/* ページネーション */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(articles.length / itemsPerPage)}
              page={articlePage}
              onChange={(_, page) => setArticlePage(page)}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 0,
                  '&.Mui-selected': {
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  },
                },
              }}
            />
          </Box>

            </>
          )}
        </Box>
      )}

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

      {/* Toast通知 */}
      <Toast toast={toast} onClose={hideToast} />
    </Box>
  );
};

export default AdminPanel;
