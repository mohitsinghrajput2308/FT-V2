// Supabase Edge Function: paddle-webhook
// Handles all Paddle subscription lifecycle events

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Map Paddle Price IDs → your plan names
// Replace these with your actual Paddle Price IDs from Step 2
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

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          email: email,
          paddle_subscription_id: data.id,
          paddle_customer_id: data.customer_id,
          plan: planInfo.plan,
          billing_cycle: planInfo.cycle,
          status: isTrialing ? 'trialing' : 'active',
          trial_ends_at: trialEndsAt,
          current_period_ends_at: data.current_billing_period?.ends_at ?? null,
        }, { onConflict: 'user_id' });
        break;
      }

      // ── Subscription renewed / updated ────────────────────────
      case 'subscription.updated': {
        const priceId = data.items?.[0]?.price?.id;
        const planInfo = PRICE_TO_PLAN[priceId] ?? { plan: 'free', cycle: 'monthly' };
        const email = data.custom_data?.email;

        // Prepare updates, optionally including email if it's present
        const updates: any = {
          plan: planInfo.plan,
          billing_cycle: planInfo.cycle,
          status: data.status === 'trialing' ? 'trialing' : 'active',
          current_period_ends_at: data.current_billing_period?.ends_at ?? null,
        };
        if (email) {
          updates.email = email;
        }

        await supabase.from('subscriptions')
          .update(updates)
          .eq('paddle_subscription_id', data.id);
        break;
      }

      // ── Payment succeeded ─────────────────────────────────────
      case 'transaction.completed': {
        if (data.subscription_id) {
          await supabase.from('subscriptions')
            .update({
              status: 'active',
              current_period_ends_at: data.billing_period?.ends_at ?? null,
            })
            .eq('paddle_subscription_id', data.subscription_id);
        }
        break;
      }

      // ── Payment failed / past due ─────────────────────────────
      case 'transaction.payment_failed':
      case 'subscription.past_due': {
        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('paddle_subscription_id', data.id ?? data.subscription_id);
        break;
      }

      // ── Subscription canceled ─────────────────────────────────
      case 'subscription.canceled': {
        await supabase.from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: data.canceled_at ?? new Date().toISOString(),
          })
          .eq('paddle_subscription_id', data.id);
        break;
      }

      // ── Subscription paused ───────────────────────────────────
      case 'subscription.paused': {
        await supabase.from('subscriptions')
          .update({ status: 'paused' })
          .eq('paddle_subscription_id', data.id);
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
