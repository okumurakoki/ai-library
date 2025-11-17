import React, { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Check as CheckIcon,
} from '@mui/icons-material';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';

// Stripeの初期化
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PricingPlan: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: '無料プラン',
      price: '¥0',
      period: '/ 永久無料',
      description: 'まずはここから始めよう',
      features: [
        'プロンプト閲覧 (20個まで)',
        'プロンプトコピー無制限',
        'お気に入り保存 (50個まで)',
        'カスタムプロンプト作成 (10個まで)',
        'エクスポート/インポート機能',
      ],
      recommended: false,
      buttonText: '無料で登録',
      color: '#000',
      priceId: null, // 無料プランなのでなし
    },
    {
      name: 'スタンダードプラン',
      price: '¥1,500',
      period: '/ 月',
      description: 'もっと活用したい方に',
      features: [
        'すべてのプロンプト見放題 (無制限)',
        'プロンプトコピー無制限',
        'お気に入り保存 (100個まで)',
        'カスタムプロンプト作成 (50個まで)',
        'エクスポート/インポート機能',
        'AIニュース・記事の閲覧',
        '統計機能',
        '毎月新規プロンプト追加',
      ],
      recommended: true,
      buttonText: '今すぐ登録',
      color: '#000',
      priceId: 'price_1SUYLXKnrmty0hAGakLAAHqk',
    },
    {
      name: 'プレミアムプラン',
      price: '¥2,500',
      period: '/ 月',
      description: 'すべての機能を使いこなす',
      features: [
        'すべてのプロンプト見放題 (無制限)',
        'プロンプトコピー無制限',
        'お気に入り保存 (500個まで)',
        'カスタムプロンプト作成 (150個まで)',
        'フォルダ管理機能',
        'AIニュース・記事の閲覧',
        '統計機能',
        '優先サポート',
        '毎月新規プロンプト追加',
      ],
      recommended: false,
      buttonText: '今すぐアップグレード',
      color: '#000',
      priceId: 'price_1SUYN8Knrmty0hAG7xWd5VQO',
    },
  ];

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      // 無料プランの場合はログイン画面へ
      if (!user) {
        // TODO: Clerkのログイン画面を表示
        alert('ログインしてください');
        return;
      }
      alert('既に無料プランをご利用中です');
      return;
    }

    if (!user) {
      alert('ログインしてからご購入ください');
      return;
    }

    setLoading(planName);

    try {
      // TODO: バックエンドAPIエンドポイントを作成後に置き換え
      // 一旦Stripe Checkoutに直接遷移する実装
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe initialization failed');
      }

      // バックエンドAPIを呼び出してCheckoutセッションを作成
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Stripe Checkoutにリダイレクト
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          料金プラン
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
          あなたに最適なプランを選んで、AIプロンプトライブラリを活用しましょう
        </Typography>
      </Box>

      {/* プランカード */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 8,
          pt: 3, // RECOMMENDEDバッジの表示スペース確保
        }}
      >
        {plans.map((plan) => (
          <Box key={plan.name} sx={{ position: 'relative' }}>
            <Card
              sx={{
                border: plan.recommended ? '3px solid #000' : '1px solid #e0e0e0',
                borderRadius: 0,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                '&:hover': {
                  transform: plan.recommended ? 'scale(1.07)' : 'scale(1.02)',
                  boxShadow: plan.recommended ? '0 8px 24px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {plan.recommended && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#000',
                    color: '#fff',
                    px: 3,
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: 1,
                    zIndex: 10, // 重なり順を最前面に
                    whiteSpace: 'nowrap', // テキストの折り返しを防止
                  }}
                >
                  RECOMMENDED
                </Box>
              )}
              <CardContent sx={{ p: 4, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5, color: plan.color }}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#666', mb: 3, minHeight: 40 }}
                >
                  {plan.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 4 }}>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontSize: { xs: '2.2rem', sm: '2.8rem' }, color: plan.color }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', ml: 1 }}>
                    {plan.period}
                  </Typography>
                </Box>
                <List sx={{ mb: 'auto' }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.75 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon sx={{ color: plan.color, fontSize: '1.2rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Box sx={{ p: 4, pt: 2 }}>
                <Button
                  variant={plan.recommended ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loading === plan.name}
                  sx={{
                    borderRadius: 0,
                    backgroundColor: plan.recommended ? '#000' : 'transparent',
                    borderColor: plan.color,
                    color: plan.recommended ? '#fff' : plan.color,
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '0.95rem',
                    letterSpacing: 0.5,
                    '&:hover': {
                      backgroundColor: plan.recommended ? '#333' : 'rgba(0,0,0,0.05)',
                      borderColor: plan.color,
                    },
                  }}
                >
                  {loading === plan.name ? (
                    <CircularProgress size={24} sx={{ color: plan.recommended ? '#fff' : '#000' }} />
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* 比較表 */}
      <Box sx={{ mb: 8, backgroundColor: '#fafafa', p: 4, border: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          機能比較表
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { feature: 'プロンプト閲覧', free: '20個', standard: '無制限', premium: '無制限' },
            { feature: 'プロンプトコピー', free: '無制限', standard: '無制限', premium: '無制限' },
            { feature: 'お気に入り保存', free: '50個', standard: '100個', premium: '500個' },
            { feature: 'カスタムプロンプト作成', free: '10個', standard: '50個', premium: '150個' },
            { feature: 'フォルダ管理', free: '不可', standard: '不可', premium: '◯' },
            { feature: 'AIニュース・記事', free: '不可', standard: '◯', premium: '◯' },
            { feature: '統計機能', free: '不可', standard: '◯', premium: '◯' },
          ].map((row, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 2,
                p: 2,
                backgroundColor: '#fff',
                borderLeft: '3px solid #000',
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.feature}</Typography>
              <Typography sx={{ textAlign: 'center', fontSize: '0.85rem' }}>{row.free}</Typography>
              <Typography sx={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{row.standard}</Typography>
              <Typography sx={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{row.premium}</Typography>
            </Box>
          ))}
        </Box>
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
