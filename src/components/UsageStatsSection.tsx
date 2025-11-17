import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { SAMPLE_PROMPTS } from '../data/prompts';

interface UsageStatsSectionProps {
  stats: {
    totalCopies: number;
    todayCopies: number;
    thisMonthCopies: number;
    mostUsedPrompts: { promptId: string; count: number }[];
    recentPrompts: string[];
  };
}

const UsageStatsSection: React.FC<UsageStatsSectionProps> = ({ stats }) => {
  // プロンプトIDから詳細情報を取得
  const getPromptTitle = (promptId: string) => {
    const prompt = SAMPLE_PROMPTS.find((p) => p.id === promptId);
    return prompt ? prompt.title : '不明なプロンプト';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        使用状況
      </Typography>

      {/* 統計カード */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            backgroundColor: '#fafafa',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ContentCopyIcon sx={{ fontSize: 20, color: '#666', mr: 1 }} />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                総コピー数
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.totalCopies}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            backgroundColor: '#fafafa',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TodayIcon sx={{ fontSize: 20, color: '#666', mr: 1 }} />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                今日のコピー数
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.todayCopies}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            backgroundColor: '#fafafa',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarMonthIcon sx={{ fontSize: 20, color: '#666', mr: 1 }} />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                今月のコピー数
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.thisMonthCopies}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            backgroundColor: '#fafafa',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 20, color: '#666', mr: 1 }} />
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                よく使うプロンプト数
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.mostUsedPrompts.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 最近使ったプロンプト */}
      {stats.recentPrompts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            最近使ったプロンプト
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {stats.recentPrompts.slice(0, 5).map((promptId) => (
              <Chip
                key={promptId}
                label={getPromptTitle(promptId)}
                size="small"
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  fontSize: '0.85rem',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* よく使うプロンプトTop 5 */}
      {stats.mostUsedPrompts.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            よく使うプロンプト Top 5
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stats.mostUsedPrompts.slice(0, 5).map((item, index) => (
              <Box
                key={item.promptId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: index === 0 ? '#000' : '#666',
                    minWidth: 40,
                  }}
                >
                  {index + 1}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {getPromptTitle(item.promptId)}
                </Typography>
                <Chip
                  label={`${item.count}回`}
                  size="small"
                  sx={{
                    borderRadius: 0,
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 使用履歴がない場合 */}
      {stats.totalCopies === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="body2" sx={{ color: '#666' }}>
            まだプロンプトをコピーしていません
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
            プロンプトをコピーすると、使用履歴がここに表示されます
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsageStatsSection;
