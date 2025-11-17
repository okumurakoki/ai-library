import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'real-estate', name: '不動産', icon: 'Business' },
  { id: 'accounting', name: '経理・会計', icon: 'AccountBalance' },
  { id: 'marketing', name: 'マーケティング', icon: 'Campaign' },
  { id: 'legal', name: '法務', icon: 'Gavel' },
  { id: 'hr', name: '人事・採用', icon: 'People' },
  { id: 'sales', name: '営業', icon: 'Handshake' },
  { id: 'support', name: 'カスタマーサポート', icon: 'SupportAgent' },
  { id: 'engineering', name: 'IT・エンジニアリング', icon: 'Code' },
  { id: 'education', name: '教育', icon: 'School' },
  { id: 'healthcare', name: '医療・ヘルスケア', icon: 'LocalHospital' },
  { id: 'restaurant', name: '飲食', icon: 'Restaurant' },
  { id: 'manufacturing', name: '製造業', icon: 'Factory' },
  { id: 'retail', name: '小売・EC', icon: 'ShoppingCart' },
  { id: 'finance', name: '金融', icon: 'AccountBalanceWallet' },
  { id: 'consulting', name: 'コンサルティング', icon: 'BusinessCenter' },
  { id: 'creative', name: 'クリエイティブ', icon: 'Palette' },
  { id: 'pr', name: '広報・PR', icon: 'CampaignOutlined' },
  { id: 'other', name: 'その他', icon: 'Star' },
];

export const getCategoryName = (categoryId: string): string => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.name : 'その他';
};

export const getCategoryIcon = (categoryId: string): string => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.icon : 'Star';
};
