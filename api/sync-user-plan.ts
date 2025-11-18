import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';

// Clerkクライアントの初期化
// Updated: 2025-11-19
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Supabaseからサブスクリプション情報を取得
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // サブスクリプションがない場合はfreeプランに設定
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: 'free',
        },
      });
      return res.status(200).json({ plan: 'free', message: 'No active subscription, set to free plan' });
    }

    // サブスクリプションのステータスを確認
    if (data.status === 'active') {
      // アクティブなサブスクリプションがある場合はClerkを更新
      const planType = data.plan_type || 'premium';

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: planType,
          stripeCustomerId: data.stripe_customer_id,
        },
      });

      return res.status(200).json({ plan: planType, message: 'User plan synced successfully' });
    } else {
      // 非アクティブなサブスクリプションの場合はfreeプランに設定
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: 'free',
        },
      });
      return res.status(200).json({ plan: 'free', message: 'Inactive subscription, set to free plan' });
    }
  } catch (error: any) {
    console.error('Sync user plan error:', error);
    return res.status(500).json({ error: error.message });
  }
}
