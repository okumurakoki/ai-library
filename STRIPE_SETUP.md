# Stripe決済の設定ガイド

## 1. Stripeの商品・価格の作成

### 1.1 Stripe Dashboardにログイン
https://dashboard.stripe.com/

### 1.2 商品を作成

**スタンダードプラン（¥1,500/月）**:
1. Products > Add product
2. Name: `AI Library - スタンダードプラン`
3. Description: `すべてのプロンプト見放題、AI記事閲覧、統計機能`
4. Pricing:
   - Price: `¥1,500`
   - Billing period: `Monthly`
5. 作成後、Price IDをコピー（例: `price_xxxxxxxxxxxxx`）

**プレミアムプラン（¥3,000/月）**:
1. Products > Add product
2. Name: `AI Library - プレミアムプラン`
3. Description: `すべての機能、優先サポート、フォルダ管理`
4. Pricing:
   - Price: `¥3,000`
   - Billing period: `Monthly`
5. 作成後、Price IDをコピー（例: `price_xxxxxxxxxxxxx`）

## 2. Price IDを更新

`src/pages/PricingPlan.tsx` の以下の部分を更新:

```typescript
{
  name: 'スタンダードプラン',
  // ...
  priceId: 'price_xxxxxxxxxxxxx', // ← ここにコピーしたPrice IDを貼り付け
},
{
  name: 'プレミアムプラン',
  // ...
  priceId: 'price_xxxxxxxxxxxxx', // ← ここにコピーしたPrice IDを貼り付け
},
```

## 3. Vercelの環境変数を設定

### 3.1 Vercel Dashboardで環境変数を追加

https://vercel.com/your-username/ai-library/settings/environment-variables

以下の環境変数を追加:

```bash
# Stripe公開可能キー（既に設定済み）
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51L03uYKnrmty0hAGCscadQwfeLuvdxROQssLEUq3pmWkIaLLYbsFLp1b6Ll5YEHHQpxDZAMlchXkCslQo79NU1XN00eHmlfoQH

# Stripeシークレットキー（新規追加）
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# Stripe Webhookシークレット（後で設定）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Supabase Service Role Key（新規追加）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel URL（本番環境）
VERCEL_URL=https://library.oku-ai.co.jp
```

### 3.2 Stripeシークレットキーの取得

1. Stripe Dashboard > Developers > API keys
2. Secret key の `Reveal test key` または `Reveal live key` をクリック
3. キーをコピーして、Vercelの環境変数に設定

### 3.3 Supabase Service Role Keyの取得

1. Supabase Dashboard > Project Settings > API
2. `service_role` キーをコピー
3. Vercelの環境変数に設定

⚠️ **注意**: Service Role Keyは強力な権限を持つため、絶対にフロントエンドで使用しないでください。

## 4. Stripe Webhookの設定

### 4.1 Webhookエンドポイントの追加

1. Stripe Dashboard > Developers > Webhooks > Add endpoint
2. Endpoint URL: `https://library.oku-ai.co.jp/api/stripe-webhook`
3. Events to send: 以下を選択
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Add endpoint をクリック

### 4.2 Webhook Signing Secretの取得

1. 作成したWebhookをクリック
2. `Signing secret` セクションの `Reveal` をクリック
3. キーをコピー（`whsec_` で始まる）
4. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` に設定

## 5. テスト

### 5.1 テストモードでの確認

本番環境にデプロイする前に、テストモードで動作確認:

1. Stripe Dashboardを「Test mode」に切り替え
2. テスト用のPrice IDを作成
3. PricingPlan.tsxのpriceIdをテスト用に更新
4. テストカードで決済テスト:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付
   - CVC: 任意の3桁

### 5.2 本番環境での確認

1. Stripe Dashboardを「Live mode」に切り替え
2. 本番用のPrice IDを使用
3. 実際のカードで少額決済をテスト

## 6. 決済フロー

1. ユーザーが料金プランページで「今すぐ登録」をクリック
2. `/api/create-checkout-session` APIが呼ばれる
3. Stripe Checkoutページにリダイレクト
4. ユーザーがカード情報を入力
5. 決済成功時: `/?payment=success&session_id=xxx` にリダイレクト
6. サンクスページが表示される
7. Stripe Webhookが `/api/stripe-webhook` を呼び出す
8. Supabaseのuser_subscriptionsテーブルが更新される

## 7. トラブルシューティング

### Webhookが動作しない場合

1. Stripe Dashboard > Webhooks でイベントログを確認
2. Vercel Dashboard > Deployments > Functions でログを確認
3. Webhook Signing Secretが正しく設定されているか確認

### 決済完了後にプランが反映されない場合

1. Supabaseのuser_subscriptionsテーブルを確認
2. Webhookイベントが正常に処理されたか確認
3. ユーザーのClerk metadataを確認

## 8. セキュリティ

- シークレットキーは絶対にGitにコミットしない
- Webhook署名検証を必ず実装する
- HTTPS通信のみ許可する
- 環境変数はVercelで管理する

## 9. 参考リンク

- [Stripe Checkout ドキュメント](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks ドキュメント](https://stripe.com/docs/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
