# デプロイガイド - Vercel + Supabase + Clerk + Stripe

このガイドでは、AI Libraryアプリケーションを本番環境にデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- Supabaseアカウント
- Clerkアカウント
- Stripeアカウント

## 1. Supabaseのセットアップ

### 1.1 プロジェクトの作成

1. [Supabase](https://supabase.com/)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力
   - Project Name: `ai-library-production`
   - Database Password: 強力なパスワードを設定
   - Region: `Tokyo (ap-northeast-1)`
4. 「Create new project」をクリック

### 1.2 データベーステーブルの作成

`SUPABASE_SETUP.md`の手順に従ってテーブルを作成してください。

### 1.3 認証情報の取得

Settings > API から以下を取得:
- Project URL
- anon/public key

## 2. Clerkのセットアップ

### 2.1 アプリケーションの作成

1. [Clerk](https://clerk.com/)にログイン
2. 「Create application」をクリック
3. アプリケーション名を入力: `AI Library`
4. 認証方法を選択（Email, Google, GitHubなど）
5. 「Create application」をクリック

### 2.2 ドメインの設定

1. Configure > Domain から本番ドメインを設定
2. `library.oku-ai.co.jp` を追加

### 2.3 環境変数の取得

API Keys から以下を取得:
- Publishable Key: `pk_live_xxxxx`
- Secret Key: `sk_live_xxxxx`

### 2.4 Webhookの設定（オプション）

1. Configure > Webhooks > Add endpoint
2. Endpoint URL: `https://library.oku-ai.co.jp/api/clerk/webhook`
3. イベントを選択: `user.created`, `user.updated`
4. Webhook Secretを保存

## 3. Stripeのセットアップ

### 3.1 プロダクトの作成

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. Products > Add product
3. プロダクト情報を入力
   - Name: `AI Library Premium`
   - Description: `月額プレミアムプラン`
   - Pricing: Recurring, Monthly, ¥1,500

### 3.2 Price IDの取得

作成したプロダクトの Price ID (`price_xxxxx`) をコピー

### 3.3 環境変数の取得

Developers > API keys から:
- Publishable key: `pk_live_xxxxx`
- Secret key: `sk_live_xxxxx`

### 3.4 Webhookの設定

1. Developers > Webhooks > Add endpoint
2. Endpoint URL: `https://library.oku-ai.co.jp/api/stripe/webhook`
3. イベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Webhook Signing Secretを保存

## 4. GitHubリポジトリの準備

### 4.1 リポジトリの作成

```bash
cd ai-library
git init
git add .
git commit -m "Initial commit: AI Library application"
git branch -M main
git remote add origin https://github.com/your-username/ai-library.git
git push -u origin main
```

### 4.2 .gitignoreの確認

以下が含まれていることを確認:

```
node_modules
dist
.env
.env.local
.DS_Store
```

## 5. Vercelへのデプロイ

### 5.1 プロジェクトのインポート

1. [Vercel](https://vercel.com/)にログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト名: `ai-library`
5. Framework Preset: `Vite`

### 5.2 環境変数の設定

Environment Variables に以下を追加:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

### 5.3 ビルド設定の確認

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 5.4 デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

## 6. カスタムドメインの設定

### 6.1 Vercelでドメインを追加

1. Project Settings > Domains
2. `library.oku-ai.co.jp` を追加
3. DNS設定の指示が表示される

### 6.2 DNSレコードの設定

お使いのDNSプロバイダーで以下を設定:

**Aレコード**:
```
Type: A
Name: library
Value: 76.76.21.21 (Vercelから提供されるIP)
```

**CNAMEレコード** (推奨):
```
Type: CNAME
Name: library
Value: cname.vercel-dns.com
```

### 6.3 SSL証明書の確認

Vercelが自動的にSSL証明書を発行します（数分かかる場合があります）。

## 7. 本番環境の確認

### 7.1 動作確認項目

- [ ] アプリケーションが正常に表示される
- [ ] プロンプトの一覧が表示される
- [ ] プロンプトのコピーが機能する
- [ ] お気に入り機能が動作する
- [ ] 記事一覧が表示される
- [ ] 料金プランページが表示される
- [ ] 管理者パネルにアクセスできる（管理者のみ）
- [ ] レスポンシブデザインが正しく動作する

### 7.2 Clerk認証のテスト

- [ ] ユーザー登録ができる
- [ ] ログインができる
- [ ] ログアウトができる
- [ ] プロフィール情報が表示される

### 7.3 Stripe決済のテスト

テストモードで以下を確認:

- [ ] Checkoutページへ遷移できる
- [ ] テストカード番号で決済できる
  - カード番号: `4242 4242 4242 4242`
  - 有効期限: 任意の未来の日付
  - CVC: 任意の3桁
- [ ] 決済後にプレミアムプランに変更される
- [ ] Webhookが正常に動作する

## 8. 監視とメンテナンス

### 8.1 Vercelのログ確認

Deployments > Logs でエラーやパフォーマンスを確認

### 8.2 Supabaseの監視

Database > Performance でクエリのパフォーマンスを監視

### 8.3 Stripeのダッシュボード

Payments、Subscriptions、Customers を定期的に確認

## 9. トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドを確認
npm run build

# 型エラーの確認
npm run type-check
```

### 環境変数エラー

- Vercelの Environment Variables が正しく設定されているか確認
- すべての `VITE_` プレフィックスが付いているか確認

### Webhook エラー

- Webhook URLが正しいか確認
- Webhook Secretが環境変数に設定されているか確認
- Stripeダッシュボードでイベントログを確認

## 10. 次のステップ

- [ ] Google Analyticsの設定
- [ ] Sentryなどのエラートラッキング設定
- [ ] 本番データのバックアップ設定
- [ ] パフォーマンス最適化
- [ ] SEO対策

## サポート

問題が発生した場合は、以下を確認してください:

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
