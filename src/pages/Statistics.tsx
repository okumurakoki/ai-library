import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import UsageStatsSection from '../components/UsageStatsSection';
import { usePromptHistory } from '../hooks/usePromptHistory';
import { SAMPLE_PROMPTS } from '../data/prompts';
import { getCategoryName } from '../data/categories';

const Statistics: React.FC = () => {
  const { stats, getAllHistory, getDailyStats } = usePromptHistory();
  const [dailyStats, setDailyStats] = useState<{ date: string; copies: number }[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 日別統計データと使用履歴を非同期で読み込み
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // 日別統計を取得
        const daily = await getDailyStats(30);
        setDailyStats(daily);

        // 最近の使用履歴を取得
        const history = await getAllHistory();
        const recent = history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20)
          .map((item) => {
            const prompt = SAMPLE_PROMPTS.find((p) => p.id === item.promptId);
            const date = new Date(item.timestamp);
            return {
              ...item,
              title: prompt?.title || '不明なプロンプト',
              category: prompt?.category || 'unknown',
              categoryName: prompt ? getCategoryName(prompt.category) : '不明',
              dateStr: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(
                date.getMinutes()
              ).padStart(2, '0')}`,
            };
          });
        setRecentHistory(recent);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [stats.totalCopies]); // stats が変わったら再読み込み

  // プロンプトランキング（詳細情報付き）
  const promptRanking = useMemo(() => {
    return stats.mostUsedPrompts
      .map((item) => {
        const prompt = SAMPLE_PROMPTS.find((p) => p.id === item.promptId);
        return {
          ...item,
          title: prompt?.title || '不明なプロンプト',
          category: prompt?.category || 'unknown',
          categoryName: prompt ? getCategoryName(prompt.category) : '不明',
        };
      })
      .slice(0, 10);
  }, [stats.mostUsedPrompts]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          統計
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          プロンプトの使用状況を確認できます
        </Typography>
      </Box>

      {/* 使用統計セクション */}
      <UsageStatsSection stats={stats} />

      {/* 使用推移グラフ（過去30日） */}
      <Card
        sx={{
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            使用推移（過去30日間）
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="copies"
                stroke="#000"
                strokeWidth={2}
                name="コピー数"
                dot={{ fill: '#000', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* プロンプトランキング */}
      <Card
        sx={{
          mb: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <TrendingUpIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              よく使うプロンプト TOP 10
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>順位</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>プロンプト</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>カテゴリ</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                    使用回数
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promptRanking.length > 0 ? (
                  promptRanking.map((item, index) => (
                    <TableRow key={item.promptId} hover>
                      <TableCell>
                        <Chip
                          label={`${index + 1}`}
                          size="small"
                          sx={{
                            backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f5f5f5',
                            fontWeight: 700,
                            minWidth: 32,
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip label={item.categoryName} size="small" />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.count}回
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                      まだプロンプトを使用していません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 最近の使用履歴 */}
      <Card
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            最近の使用履歴
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>日時</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>プロンプト</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>カテゴリ</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                    回数
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentHistory.length > 0 ? (
                  recentHistory.map((item) => (
                    <TableRow key={`${item.promptId}-${item.timestamp}`} hover>
                      <TableCell sx={{ color: '#666' }}>{item.dateStr}</TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip label={item.categoryName} size="small" />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.count}回
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                      まだプロンプトを使用していません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
