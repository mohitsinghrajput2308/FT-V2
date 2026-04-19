// Supabase Edge Function: upgrade-subscription
// Upgrades an existing Paddle subscription from Pro → Business (or any in-place plan switch)
// WITHOUT creating a new checkout — uses Paddle's PATCH /subscriptions API instead.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PADDLE_API_KEY           = Deno.env.get('PADDLE_API_KEY')!;
const PADDLE_ENV               = Deno.env.get('PADDLE_ENV') ?? 'sandbox'; // 'sandbox' | 'production'

const PADDLE_BASE = PADDLE_ENV === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

// Same price IDs as in paddle.js / paddle-webhook
const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: 'pri_01kpjeaqgj2jee2kdyhvpwb1dt', // no trial
    yearly:  'pri_01kpjen114xwk6rv87t0mrse8j',  // no trial
  },
  business: {
    monthly: 'pri_01kpjf646mpzsfy5g9j9079rwe', // no trial
    yearly:  'pri_01kpjffwt20daa9ra66myxxed8',  // no trial
  },
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  try {
    // ── 1. Verify the calling user via their Supabase JWT ────────────────────
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Use service-role client to verify the user token securely
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Parse request body ────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { targetPlan, cycle } = body as { targetPlan?: string; cycle?: string };

    if (!targetPlan || !PRICE_IDS[targetPlan]) {
      return new Response(JSON.stringify({ error: 'Invalid targetPlan. Must be "pro" or "business"' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 3. Load the user's current subscription from DB ─────────────────────
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('paddle_subscription_id, billing_cycle, plan, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError || !sub) {
      return new Response(JSON.stringify({ error: 'No subscription found for this user' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (!sub.paddle_subscription_id) {
      return new Response(JSON.stringify({ error: 'No Paddle subscription ID on record' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Don't allow downgrade via this endpoint (use cancellation flow instead)
    const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, business: 2 };
    if ((PLAN_RANK[targetPlan] ?? 0) <= (PLAN_RANK[sub.plan] ?? 0)) {
      return new Response(JSON.stringify({ error: 'This endpoint is for upgrades only. To downgrade, manage your subscription.' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Resolve billing cycle: use provided cycle, fallback to user's current cycle
    const billingCycle = (cycle === 'monthly' || cycle === 'yearly') ? cycle : (sub.billing_cycle ?? 'monthly');
    const newPriceId = PRICE_IDS[targetPlan]?.[billingCycle];

    if (!newPriceId) {
      return new Response(JSON.stringify({ error: `No price ID found for ${targetPlan}/${billingCycle}` }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Call Paddle API to update subscription in-place ───────────────────
    // proration_billing_mode: 'prorated_immediately' charges the price difference right now
    // and gives Business access immediately — no waiting until the next billing cycle.
    const paddleRes = await fetch(
      `${PADDLE_BASE}/subscriptions/${sub.paddle_subscription_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${PADDLE_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          items: [{ price_id: newPriceId, quantity: 1 }],
          proration_billing_mode: 'prorated_immediately',
        }),
      }
    );

    const paddleData = await paddleRes.json();

    if (!paddleRes.ok) {
      console.error('[upgrade-subscription] Paddle API error:', JSON.stringify(paddleData));
      return new Response(JSON.stringify({
        error: 'Paddle API error',
        detail: paddleData?.error?.detail ?? 'Unknown Paddle error',
      }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ── 5. Optimistically update the DB immediately ──────────────────────────
    // The webhook (subscription.updated) will also fire and write the same data —
    // this just makes the UI update instantly without waiting for the webhook.
    await supabase
      .from('subscriptions')
      .update({
        plan:         targetPlan,
        billing_cycle: billingCycle,
        status:       'active',
      })
      .eq('user_id', user.id);

    console.log(`[upgrade-subscription] ✅ ${user.email} upgraded to ${targetPlan}/${billingCycle}`);

    return new Response(JSON.stringify({
      success: true,
      plan:    targetPlan,
      cycle:   billingCycle,
      message: `Successfully upgraded to ${targetPlan}`,
    }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[upgrade-subscription] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
