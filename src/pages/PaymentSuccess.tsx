import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUser } from '@clerk/clerk-react';

const PaymentSuccess = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    const syncUserPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ユーザープランを同期
        const response = await fetch('/api/sync-user-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User plan synced:', data.plan);

          // Clerkのキャッシュをリフレッシュするために少し待つ
          await new Promise(resolve => setTimeout(resolve, 2000));

          // ページをリロードしてメタデータを更新
          window.location.reload();
        } else {
          console.error('Failed to sync user plan');
        }
      } catch (error) {
        console.error('Sync error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && user) {
      syncUserPlan();
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [sessionId, user]);

  const handleGoToLibrary = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
          }}
        >
          <CardContent>
            {/* 成功アイコン */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: '#4caf50',
                }}
              />
            </Box>

            {/* タイトル */}
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              お支払いが完了しました
            </Typography>

            {/* 説明文 */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                lineHeight: 1.8,
              }}
            >
              ありがとうございます！プレミアムプランへのアップグレードが完了しました。
              <br />
              これからすべての機能をご利用いただけます。
            </Typography>

            {/* プレミアム特典の説明 */}
            <Box
              sx={{
                backgroundColor: '#f9f9f9',
                borderRadius: 0,
                p: 3,
                mb: 4,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                ご利用いただける特典
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  すべてのプロンプト（70個以上）を無制限に利用
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  お気に入り登録が無制限
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  カスタムプロンプトの作成・保存
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  AI記事・ニュースの閲覧
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  詳細な利用統計の確認
                </Typography>
              </Box>
            </Box>

            {/* 確認メールの案内 */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              確認メールをご登録のメールアドレスに送信しました。
              <br />
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </Typography>

            {/* ボタン */}
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToLibrary}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              プロンプトライブラリへ
            </Button>
          </CardContent>
        </Card>

        {/* サポート情報 */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            ご不明な点がございましたら、
            <a
              href="mailto:support@oku-ai.co.jp"
              style={{ color: '#000', textDecoration: 'underline' }}
            >
              サポート
            </a>
            までお問い合わせください。
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentSuccess;
