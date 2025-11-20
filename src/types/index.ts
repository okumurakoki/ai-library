// プロンプトデータ型
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string; // 大分類（業種）
  useCase?: string[]; // 中分類（用途カテゴリ）
  tags?: string[]; // 小分類（詳細タグ）
  usage?: string;
  example?: string;
  isPremium?: boolean; // 後方互換性のため残す
  planType?: 'free' | 'standard' | 'premium'; // 新しいプラン形式
  createdAt: string;
  updatedAt: string;
}

// 記事データ型
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: 'news' | 'tips';
  tags?: string[];
  author?: string;
  publishedAt: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// カテゴリ定義型
export interface Category {
  id: string;
  name: string;
  icon: string;
}

// ユーザープロファイル型
export interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  displayName?: string;
  isAdmin: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// サブスクリプション型
export interface UserSubscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planType: 'free' | 'premium';
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// KPI統計データ型
export interface KPIStats {
  activeUsers: number;
  monthlyRevenue: number;
  promptCopies: number;
  newSignups: number;
  activeUsersChange: number;
  revenueChange: number;
  copiesChange: number;
  signupsChange: number;
}

// ユーザーアクティビティ型
export interface UserActivity {
  id: string;
  name: string;
  email: string;
  lastAccess: string;
  plan: 'free' | 'premium';
  status: 'active' | 'inactive';
}

// お気に入りフォルダ型
export interface FavoriteFolder {
  id: string;
  name: string;
  promptIds: string[];
  createdAt: string;
  updatedAt: string;
}
