import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Stripeクライアントの初期化（テストモード用）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customer ID' });
    }

    // Customer Portalセッションを作成
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://library.oku-ai.co.jp/',
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
