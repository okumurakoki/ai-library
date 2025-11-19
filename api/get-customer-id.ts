import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの初期化
// Updated: 2025-11-19
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

    // Supabaseからstripe_customer_idを取得（最新のものを取得）
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.status(200).json({ customerId: data[0].stripe_customer_id });
  } catch (error: any) {
    console.error('Get customer ID error:', error);
    return res.status(500).json({ error: error.message });
  }
}
