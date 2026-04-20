// Supabase Edge Function: paddle-webhook
// Handles all Paddle subscription lifecycle events
// Records: subscriptions, subscription_events, transactions, and updates users

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Map Paddle Price IDs → your plan names
const PRICE_TO_PLAN: Record<string, { plan: string; cycle: string }> = {
  // Pro Monthly
  'pri_01kpjef8c48hr2hb60fmtgn1yx': { plan: 'pro',      cycle: 'monthly' }, // 7-day trial
  'pri_01kpjeaqgj2jee2kdyhvpwb1dt': { plan: 'pro',      cycle: 'monthly' }, // no trial
  // Pro Yearly
  'pri_01kpjerzv1sxndswe1xy8x3t3c': { plan: 'pro',      cycle: 'yearly'  }, // 14-day trial
  'pri_01kpjen114xwk6rv87t0mrse8j': { plan: 'pro',      cycle: 'yearly'  }, // no trial
  // Business Monthly
  'pri_01kpjfakbv47fhyqa899704nhg': { plan: 'business', cycle: 'monthly' }, // 7-day trial
  'pri_01kpjf646mpzsfy5g9j9079rwe': { plan: 'business', cycle: 'monthly' }, // no trial
  // Business Yearly
  'pri_01kpjfmzrd0ae227q77qqja3jv': { plan: 'business', cycle: 'yearly'  }, // 14-day trial
  'pri_01kpjffwt20daa9ra66myxxed8': { plan: 'business', cycle: 'yearly'  }, // no trial
};

// Verify Paddle webhook signature
async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    // Paddle sends: ts=timestamp;h1=signature
    const parts = Object.fromEntries(
      signatureHeader.split(';').map(p => p.split('='))
    );
    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) return false;

    const signed = `${ts}:${rawBody}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
    const computed = Array.from(new Uint8Array(sigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return computed === h1;
  } catch {
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get('paddle-signature') ?? '';

  // Verify signature
  const isValid = await verifyPaddleSignature(rawBody, signatureHeader, PADDLE_WEBHOOK_SECRET);
  if (!isValid) {
    console.error('[paddle-webhook] Invalid signature');
    return new Response('Unauthorized', { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const { event_type, data } = event;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`[paddle-webhook] Received: ${event_type}`);

  try {
    switch (event_type) {

      // ── New subscription created (trial or paid) ──────────────
      case 'subscription.created':
      case 'subscription.activated': {
        const userId = data.custom_data?.user_id;
        const email = data.custom_data?.email;
        if (!userId) { console.error('No user_id in custom_data'); break; }

        const priceId = data.items?.[0]?.price?.id;
        const planInfo = PRICE_TO_PLAN[priceId] ?? { plan: 'free', cycle: 'monthly' };

        const isTrialing = data.status === 'trialing';
        const trialEndsAt = data.trial_dates?.ends_at ?? null;

        // Create/update subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            paddle_subscription_id: data.id,
            paddle_customer_id: data.customer_id,
            plan: planInfo.plan,
            billing_cycle: planInfo.cycle,
            status: isTrialing ? 'trialing' : 'active',
            trial_ends_at: trialEndsAt,
            trial_started_at: new Date().toISOString(),
            current_period_starts_at: data.current_billing_period?.starts_at ?? null,
            current_period_ends_at: data.current_billing_period?.ends_at ?? null,
            next_billing_date: data.current_billing_period?.ends_at ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'paddle_subscription_id' })
          .select('id')
          .single();

        if (subError) throw subError;

        // Update user's plan and subscription status
        await supabase
          .from('users')
          .update({
            current_plan: planInfo.plan,
            subscription_status: isTrialing ? 'trialing' : 'active',
          })
          .eq('id', userId);

        // Record subscription event
        await supabase.from('subscription_events').insert({
          user_id: userId,
          subscription_id: subData.id,
          event_type: 'created',
          to_plan: planInfo.plan,
          metadata: {
            price_id: priceId,
            trial: isTrialing,
          },
        });

        console.log(`[paddle-webhook] Subscription created for user ${userId}, plan: ${planInfo.plan}`);
        break;
      }

      // ── Subscription upgraded/downgraded ────────────────────────
      case 'subscription.updated': {
        const priceId = data.items?.[0]?.price?.id;
        const planInfo = PRICE_TO_PLAN[priceId] ?? { plan: 'free', cycle: 'monthly' };

        // Get old subscription to track changes
        const { data: oldSub } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('paddle_subscription_id', data.id)
          .single();

        const oldPlan = oldSub?.plan;
        const eventType = oldPlan && oldPlan !== planInfo.plan 
          ? (oldPlan === 'pro' && planInfo.plan === 'business' ? 'upgraded' : 'downgraded')
          : 'renewed';

        // Get subscription ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('paddle_subscription_id', data.id)
          .single();

        // Update subscription
        const updates: any = {
          plan: planInfo.plan,
          billing_cycle: planInfo.cycle,
          status: data.status === 'trialing' ? 'trialing' : 'active',
          current_period_starts_at: data.current_billing_period?.starts_at ?? null,
          current_period_ends_at: data.current_billing_period?.ends_at ?? null,
          next_billing_date: data.current_billing_period?.ends_at ?? null,
          updated_at: new Date().toISOString(),
        };

        await supabase.from('subscriptions')
          .update(updates)
          .eq('paddle_subscription_id', data.id);

        // Get user_id for event logging
        const { data: subWithUser } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_subscription_id', data.id)
          .single();

        // Record event
        if (subWithUser) {
          await supabase.from('subscription_events').insert({
            user_id: subWithUser.user_id,
            subscription_id: subData?.id,
            event_type: eventType,
            from_plan: oldPlan,
            to_plan: planInfo.plan,
          });

          // Update user's plan
          await supabase
            .from('users')
            .update({
              current_plan: planInfo.plan,
              subscription_status: data.status === 'trialing' ? 'trialing' : 'active',
            })
            .eq('id', subWithUser.user_id);
        }

        console.log(`[paddle-webhook] Subscription updated: ${eventType}`);
        break;
      }

      // ── Payment succeeded ─────────────────────────────────────
      case 'transaction.completed': {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, user_id, paddle_subscription_id')
          .eq('paddle_subscription_id', data.subscription_id)
          .single();

        if (subData) {
          // Update subscription status
          await supabase.from('subscriptions')
            .update({
              status: 'active',
              current_period_ends_at: data.billing_period?.ends_at ?? null,
              next_billing_date: data.billing_period?.ends_at ?? null,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('paddle_subscription_id', data.subscription_id);

          // Record transaction
          await supabase.from('transactions').insert({
            user_id: subData.user_id,
            subscription_id: subData.id,
            paddle_transaction_id: data.id,
            amount: data.details?.line_items?.[0]?.price?.total || 0,
            currency: data.details?.line_items?.[0]?.price?.currency_code || 'USD',
            status: 'completed',
            payment_method: data.payment_method_type,
            invoice_url: data.invoice_url,
            receipt_url: data.receipt_url,
          });

          // Record event
          await supabase.from('subscription_events').insert({
            user_id: subData.user_id,
            subscription_id: subData.id,
            event_type: 'renewed',
            metadata: {
              amount: data.details?.line_items?.[0]?.price?.total,
              currency: data.details?.line_items?.[0]?.price?.currency_code,
            },
          });
        }

        console.log(`[paddle-webhook] Payment completed for transaction ${data.id}`);
        break;
      }

      // ── Payment failed / past due ─────────────────────────────
      case 'transaction.payment_failed':
      case 'subscription.past_due': {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('paddle_subscription_id', data.id ?? data.subscription_id)
          .single();

        if (subData) {
          // Update subscription
          await supabase.from('subscriptions')
            .update({
              status: 'past_due',
              payment_failed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('paddle_subscription_id', data.id ?? data.subscription_id);

          // Record transaction if it's a transaction event
          if (event_type === 'transaction.payment_failed' && data.id) {
            await supabase.from('transactions').insert({
              user_id: subData.user_id,
              subscription_id: subData.id,
              paddle_transaction_id: data.id,
              amount: data.details?.line_items?.[0]?.price?.total || 0,
              currency: data.details?.line_items?.[0]?.price?.currency_code || 'USD',
              status: 'failed',
              payment_method: data.payment_method_type,
              error_code: data.reason,
              error_message: data.reason,
            });
          }

          // Record event
          await supabase.from('subscription_events').insert({
            user_id: subData.user_id,
            subscription_id: subData.id,
            event_type: 'payment_failed',
            metadata: {
              reason: data.reason,
            },
          });

          // Update user status
          await supabase
            .from('users')
            .update({ subscription_status: 'past_due' })
            .eq('id', subData.user_id);
        }

        console.log(`[paddle-webhook] Payment failed`);
        break;
      }

      // ── Subscription canceled ─────────────────────────────────
      case 'subscription.canceled': {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('paddle_subscription_id', data.id)
          .single();

        if (subData) {
          // Update subscription
          await supabase.from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: data.canceled_at ?? new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('paddle_subscription_id', data.id);

          // Record event
          await supabase.from('subscription_events').insert({
            user_id: subData.user_id,
            subscription_id: subData.id,
            event_type: 'canceled',
            metadata: {
              reason: data.cancellation_effective_at,
            },
          });

          // Update user to free plan
          await supabase
            .from('users')
            .update({
              current_plan: 'free',
              subscription_status: 'canceled',
            })
            .eq('id', subData.user_id);
        }

        console.log(`[paddle-webhook] Subscription canceled`);
        break;
      }

      // ── Subscription paused ───────────────────────────────────
      case 'subscription.paused': {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('paddle_subscription_id', data.id)
          .single();

        if (subData) {
          await supabase.from('subscriptions')
            .update({
              status: 'paused',
              updated_at: new Date().toISOString(),
            })
            .eq('paddle_subscription_id', data.id);

          // Update user status
          await supabase
            .from('users')
            .update({ subscription_status: 'paused' })
            .eq('id', subData.user_id);
        }

        console.log(`[paddle-webhook] Subscription paused`);
        break;
      }

      default:
        console.log(`[paddle-webhook] Unhandled event: ${event_type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[paddle-webhook] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
