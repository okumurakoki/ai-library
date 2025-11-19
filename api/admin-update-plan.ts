import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';

// Clerkクライアントの初期化
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
    const { userId, plan, adminKey } = req.body;

    // 簡易的な認証（本番環境では適切な認証を実装してください）
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!userId || !plan) {
      return res.status(400).json({ error: 'Missing userId or plan' });
    }

    console.log('Admin updating plan for user:', userId, 'to:', plan);

    // Clerkのメタデータを更新
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: plan,
      },
    });

    console.log('Clerk metadata updated successfully');

    return res.status(200).json({
      success: true,
      message: `Plan updated to ${plan} for user ${userId}`
    });
  } catch (error: any) {
    console.error('Admin update plan error:', error);
    return res.status(500).json({ error: error.message });
  }
}
