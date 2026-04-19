/**
 * FinTrack API Server
 * - AI Chat (Groq)
 * - Paddle Webhook Handler (subscription lifecycle)
 * - Plan-gating middleware
 */

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const Groq = require('groq-sdk');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// ─── Supabase Admin Client (service role — bypasses RLS) ──────────────────────
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Paddle Price ID → Plan mapping (reads from .env.local) ──────────────────
const PRICE_TO_PLAN = {
  [process.env.PADDLE_PRO_MONTHLY_PRICE_ID]:      { plan: 'pro',      billing_cycle: 'monthly' },
  [process.env.PADDLE_PRO_YEARLY_PRICE_ID]:       { plan: 'pro',      billing_cycle: 'yearly'  },
  [process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID]: { plan: 'business', billing_cycle: 'monthly' },
  [process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID]:  { plan: 'business', billing_cycle: 'yearly'  },
};

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true
}));

// Paddle webhook needs raw body for signature verification — apply BEFORE express.json()
app.use('/api/webhook/paddle', express.raw({ type: 'application/json' }));
app.use(express.json());

// Serve static files
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { maxAge: '1d', etag: false }));
}

// ─── Initialize Groq ──────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log('🚀 FinTrack API Server starting...');
console.log('✓ GROQ_API_KEY:', !!process.env.GROQ_API_KEY);
console.log('✓ SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('✓ PADDLE_WEBHOOK_SECRET:', !!process.env.PADDLE_WEBHOOK_SECRET);

// ─── Paddle webhook signature verifier ───────────────────────────────────────
function verifyPaddleSignature(req) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || secret === 'your_paddle_webhook_secret_here') {
    console.warn('⚠️  PADDLE_WEBHOOK_SECRET not set — skipping verification (dev only)');
    return true;
  }

  const signatureHeader = req.headers['paddle-signature'];
  if (!signatureHeader) return false;

  // Paddle sends: ts=<timestamp>;h1=<hmac_hash>
  const parts = Object.fromEntries(
    signatureHeader.split(';').map(p => p.split('='))
  );
  const ts = parts['ts'];
  const h1 = parts['h1'];

  const payload = `${ts}:${req.body.toString()}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// ─── Detect plan from webhook items array ────────────────────────────────────
function detectPlan(items = []) {
  for (const item of items) {
    const priceId = item.price?.id || item.price_id;
    if (PRICE_TO_PLAN[priceId]) return { priceId, ...PRICE_TO_PLAN[priceId] };
  }
  return null;
}

// ─── Upsert subscription in Supabase ─────────────────────────────────────────
async function upsertSubscription(data) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(data, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Supabase upsert error:', error.message);
    throw error;
  }
  console.log(`✅ DB updated → user: ${data.user_id}, plan: ${data.plan}, status: ${data.status}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PADDLE WEBHOOK  POST /api/webhook/paddle
// Register this URL in Paddle Dashboard > Developer Tools > Webhooks
// For local testing, use: npx localtunnel --port 3001 --subdomain fintrack
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/webhook/paddle', async (req, res) => {
  // 1. Verify Paddle signature
  if (!verifyPaddleSignature(req)) {
    console.warn('⚠️  Invalid Paddle signature — rejected');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { event_type, data } = event;
  console.log(`📦 Paddle event: ${event_type}`);

  try {
    // ── subscription.created / subscription.activated ─────────────────────
    if (event_type === 'subscription.created' || event_type === 'subscription.activated') {
      // IMPORTANT: You must pass user_id via Paddle's customData when opening checkout:
      // paddle.Checkout.open({ items: [...], customData: { user_id: supabaseUser.id } })
      const userId     = data.custom_data?.user_id;
      const subId      = data.id;
      const customerId = data.customer_id;
      const items      = data.items || [];
      const periodEnds = data.current_billing_period?.ends_at;
      const trialEnds  = data.trial_dates?.ends_at || null;
      const status     = data.status === 'trialing' ? 'trialing' : 'active';

      const planInfo = detectPlan(items);
      if (!planInfo) {
        console.warn('⚠️  No matching price ID found — check PRICE_TO_PLAN mapping');
        return res.status(200).json({ received: true, warning: 'Unknown price ID' });
      }

      if (!userId) {
        console.warn('⚠️  No user_id in custom_data — pass it via paddle.Checkout.open customData');
        return res.status(200).json({ received: true, warning: 'Missing user_id' });
      }

      await upsertSubscription({
        user_id:                userId,
        paddle_subscription_id: subId,
        paddle_customer_id:     customerId,
        plan:                   planInfo.plan,
        billing_cycle:          planInfo.billing_cycle,
        status,
        trial_ends_at:          trialEnds,
        current_period_ends_at: periodEnds || null,
      });
    }

    // ── subscription.updated (plan change, renewal) ───────────────────────
    else if (event_type === 'subscription.updated') {
      const subId      = data.id;
      const items      = data.items || [];
      const periodEnds = data.current_billing_period?.ends_at;
      const status     = data.status;
      const planInfo   = detectPlan(items);

      const { data: existing } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('paddle_subscription_id', subId)
        .single();

      if (existing) {
        const update = {
          status:                 status === 'trialing' ? 'trialing' : 'active',
          current_period_ends_at: periodEnds || null,
          updated_at:             new Date().toISOString(),
        };
        if (planInfo) {
          update.plan          = planInfo.plan;
          update.billing_cycle = planInfo.billing_cycle;
        }
        await supabaseAdmin
          .from('subscriptions')
          .update(update)
          .eq('paddle_subscription_id', subId);

        console.log(`✅ Subscription updated: ${subId}`);
      }
    }

    // ── subscription.canceled ─────────────────────────────────────────────
    else if (event_type === 'subscription.canceled') {
      const subId = data.id;

      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan:        'free',
          status:      'canceled',
          canceled_at: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        })
        .eq('paddle_subscription_id', subId);

      console.log(`✅ Subscription canceled → downgraded to free: ${subId}`);
    }

    // ── subscription.past_due ─────────────────────────────────────────────
    else if (event_type === 'subscription.past_due') {
      const subId = data.id;

      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('paddle_subscription_id', subId);

      console.warn(`⚠️  Subscription past due: ${subId}`);
    }

    else {
      console.log(`ℹ️  Unhandled event type: ${event_type}`);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('❌ Webhook handler error:', err.message);
    // Always return 200 so Paddle doesn't endlessly retry for DB errors
    return res.status(200).json({ received: true, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLAN-GATING MIDDLEWARE
// Usage: app.get('/api/export', requirePlan('pro'), handler)
// ═══════════════════════════════════════════════════════════════════════════════
const PLAN_RANK = { free: 0, pro: 1, business: 2 };

function requirePlan(minPlan) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized — no token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify Supabase JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch subscription from DB
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single();

    const userPlan   = sub?.plan   || 'free';
    const userStatus = sub?.status || 'active';

    // Canceled / past_due users lose paid access
    if (userStatus === 'canceled' || userStatus === 'past_due') {
      return res.status(403).json({
        error:    'Your subscription is no longer active',
        plan:     userPlan,
        required: minPlan,
      });
    }

    // Check rank
    if ((PLAN_RANK[userPlan] ?? 0) < (PLAN_RANK[minPlan] ?? 0)) {
      return res.status(403).json({
        error:    `This feature requires the ${minPlan} plan or higher`,
        plan:     userPlan,
        required: minPlan,
      });
    }

    req.user     = user;
    req.userPlan = userPlan;
    next();
  };
}

// ─── Gated example routes ─────────────────────────────────────────────────────
// Pro-only: CSV / PDF export
app.get('/api/export/csv',  requirePlan('pro'),      (req, res) => res.json({ ok: true, plan: req.userPlan }));
app.get('/api/export/pdf',  requirePlan('pro'),      (req, res) => res.json({ ok: true, plan: req.userPlan }));
// Business-only: Team invite
app.get('/api/team/invite', requirePlan('business'), (req, res) => res.json({ ok: true, plan: req.userPlan }));

// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are FinBot, a helpful AI assistant for FinTrack personal finance app.

FinTrack Features:
- Free: 50 transactions/mo, 2 budgets/goals/bills, basic reports
- Pro ($9.99/mo): 500 transactions/mo, 10 budgets/goals/bills, all 7 calculators, 3 custom categories, PDF/CSV export, priority support
- Business ($29.99/mo): Unlimited everything, team collaboration (up to 3 users), dedicated support

Key Facts:
- Payment: Paddle (Visa, Mastercard, Amex)
- Trial: 14 days free, no credit card needed
- Security: AES-256 encryption, TLS 1.2+

Be friendly, accurate, and helpful.`;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'FinTrack API server is running' });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    console.log('📨 Chat request:', message?.substring(0, 50));

    if (!message) return res.status(400).json({ error: 'Message required' });
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'No response';
    console.log('✅ Reply:', reply.substring(0, 50));
    res.status(200).json({ message: reply });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
});

// Start server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   ✅ FinTrack API Server Ready                             ║
║   📡 Chat:     http://localhost:${PORT}/api/chat               ║
║   🪝 Webhook:  http://localhost:${PORT}/api/webhook/paddle     ║
║   🏥 Health:   http://localhost:${PORT}/health                 ║
╚════════════════════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`❌ Port ${PORT} is already in use!`);
  else console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => { console.log('Server closed'); process.exit(0); });
});
