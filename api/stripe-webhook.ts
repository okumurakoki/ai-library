import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';

// Clerkクライアントの初期化
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Stripeクライアントの初期化（本番モード用）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイドではservice roleキーを使用
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // イベントタイプに応じて処理
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // サブスクリプション詳細を取得してPrice IDを確認
        let planType = 'premium';
        let planName = 'premium';

        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Price IDに応じてプランを判定
          if (priceId === 'price_1SUYLXKnrmty0hAGakLAAHqk' || priceId === 'price_1SUZ5JKnrmty0hAGbdGG4dcT') {
            // スタンダードプラン (¥1,500) - 本番 or テスト
            planType = 'standard';
            planName = 'standard';
          } else if (priceId === 'price_1SUYN8Knrmty0hAG7xWd5VQO') {
            // プレミアムプラン (¥2,500)
            planType = 'premium';
            planName = 'premium';
          }

          console.log('Detected plan:', planName, 'from price:', priceId);
        }

        // Supabaseにサブスクリプション情報を保存
        await supabase.from('user_subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_type: planType,
          status: 'active',
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Clerkのユーザーメタデータを更新
        if (userId) {
          try {
            await clerkClient.users.updateUserMetadata(userId, {
              publicMetadata: {
                plan: planName,
                stripeCustomerId: customerId,
              },
            });
            console.log('Clerk metadata updated for user:', userId, 'plan:', planName);
          } catch (error) {
            console.error('Failed to update Clerk metadata:', error);
          }
        }

        console.log('Subscription created for user:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // カスタマーIDからユーザーを検索
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          console.log('Subscription updated for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Supabaseのステータスを更新
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        // ユーザーIDを取得
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        // Clerkのユーザーメタデータを更新（freeプランにダウングレード）
        if (userSub?.user_id) {
          try {
            await clerkClient.users.updateUserMetadata(userSub.user_id, {
              publicMetadata: {
                plan: 'free',
              },
            });
            console.log('Clerk metadata downgraded to free for user:', userSub.user_id);
          } catch (error) {
            console.error('Failed to update Clerk metadata:', error);
          }
        }

        console.log('Subscription canceled for customer:', customerId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log('Payment succeeded for customer:', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log('Payment failed for customer:', customerId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
}
