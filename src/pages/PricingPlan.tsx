import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Check as CheckIcon,
} from '@mui/icons-material';

const PricingPlan: React.FC = () => {
  const plans = [
    {
      name: '無料プラン',
      price: '¥0',
      period: '/ 月',
      features: [
        '制限付きプロンプト閲覧',
        '月10回までコピー可能',
        '基本カテゴリのアクセス',
        'コミュニティサポート',
      ],
      recommended: false,
      buttonText: '無料で始める',
    },
    {
      name: 'プレミアムプラン',
      price: '¥1,500',
      period: '/ 月',
      features: [
        'すべてのプロンプト見放題',
        '無制限コピー',
        '新着プロンプトの優先アクセス',
        'AIニュース・記事の閲覧',
        'カテゴリ別フィルタリング',
        'お気に入り機能',
        '優先サポート',
        '毎月新規プロンプト追加',
      ],
      recommended: true,
      buttonText: '今すぐ登録',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            料金プラン
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            業種別に最適化された70以上のプロンプトをワンクリックでコピー
          </Typography>
        </Box>
      </Box>

      {/* プランカード */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {plans.map((plan) => (
          <Box key={plan.name}>
            <Card
              sx={{
                border: '2px solid #000',
                borderRadius: 0,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.2s',
              }}
            >
              {plan.recommended && (
                <Chip
                  label="おすすめ"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: 0,
                    fontWeight: 600,
                  }}
                />
              )}
              <CardContent sx={{ p: 4, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {plan.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem' } }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', ml: 0.5 }}>
                    {plan.period}
                  </Typography>
                </Box>
                <List sx={{ mb: 'auto' }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon sx={{ color: '#000' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Box sx={{ p: 4, pt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 0,
                    backgroundColor: '#000',
                    color: '#fff',
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  {plan.buttonText}
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* FAQ */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          よくある質問
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            {
              q: 'プレミアムプランはいつでも解約できますか？',
              a: 'はい、いつでも解約可能です。解約後も契約期間終了まではプレミアム機能をご利用いただけます。',
            },
            {
              q: '無料プランから始められますか？',
              a: 'はい、無料プランでまずお試しいただけます。いつでもプレミアムプランにアップグレード可能です。',
            },
            {
              q: 'プロンプトは定期的に追加されますか？',
              a: 'プレミアムプランでは毎月新しいプロンプトが追加されます。業界のトレンドに合わせて常に最新の内容を提供します。',
            },
            {
              q: '法人での利用は可能ですか？',
              a: '個人・法人問わずご利用いただけます。複数ライセンスをご希望の場合は、お問い合わせください。',
            },
          ].map((faq, index) => (
            <Box key={index} sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {faq.q}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                {faq.a}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PricingPlan;
