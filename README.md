# AI Library - プロンプトライブラリWebアプリケーション

業種別に分類されたAIプロンプトを管理・活用できるWebアプリケーション。月額1500円のサブスクリプションモデルで、18カテゴリ・70以上のプロンプトをワンクリックでコピーできます。

## 主な機能

- **プロンプト管理**: 18業種別に整理された70以上のプロンプト
- **ワンクリックコピー**: プロンプトを簡単にコピーして利用
- **お気に入り機能**: よく使うプロンプトをブックマーク
- **記事・ニュース**: AIの最新情報と使い方のヒント
- **料金プラン**: 無料プラン・プレミアムプラン
- **管理者パネル**: プロンプト管理、記事管理、分析ダッシュボード

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **UIフレームワーク**: Material-UI (MUI) v5
- **グラフ表示**: Recharts
- **認証**: Clerk
- **データベース**: Supabase (PostgreSQL)
- **決済**: Stripe
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成:

```bash
cp .env.example .env
```

以下の環境変数を設定:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Supabaseのセットアップ

`SUPABASE_SETUP.md`の手順に従ってデータベースをセットアップしてください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

### 5. ビルド

```bash
npm run build
```

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. プロジェクトをインポート
4. 環境変数を設定
5. デプロイ

## プロジェクト構成

```
ai-library/
├── src/
│   ├── components/          # UIコンポーネント
│   ├── pages/               # ページコンポーネント
│   ├── data/                # データ
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # ライブラリ
│   ├── types/               # 型定義
│   ├── App.tsx              # メインアプリ
│   └── main.tsx             # エントリーポイント
├── .env.example             # 環境変数テンプレート
├── SUPABASE_SETUP.md        # Supabaseセットアップガイド
└── vercel.json              # Vercel設定
```

## 18業種カテゴリ

1. 不動産
2. 経理・会計
3. マーケティング
4. 法務
5. 人事・採用
6. 営業
7. カスタマーサポート
8. IT・エンジニアリング
9. 教育
10. 医療・ヘルスケア
11. 飲食
12. 製造業
13. 小売・EC
14. 金融
15. コンサルティング
16. クリエイティブ
17. 広報・PR
18. その他

## ライセンス

MIT License
