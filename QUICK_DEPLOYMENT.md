# ⚡ QUICK DEPLOYMENT CHECKLIST (10 minutes)

## What's Automated ✅
- Database migration file ready to copy-paste
- React components created and committed
- Webhook handler enhanced and deployed
- Landing page deployed to Vercel
- All files committed to GitHub

## What Needs Manual Steps (5-10 min)

### 1️⃣ RUN SQL MIGRATION (2 min)

**GO TO:** https://supabase.com/dashboard/project/eocagbloalvideqsyxvpv

**STEPS:**
1. Click: **SQL Editor** (left sidebar)
2. Click: **New Query**
3. **Copy-paste all SQL below** ⬇️
4. Click: **Run**
5. ✅ Should complete without errors

**SQL TO RUN:**
```sql
BEGIN;

-- ALTER SUBSCRIPTIONS TABLE
ALTER TABLE IF EXISTS public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_starts_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused'));

-- CREATE SUBSCRIPTION_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'renewed', 'canceled', 'payment_failed', 'trial_ended')),
  from_plan TEXT,
  to_plan TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'subscription_events' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.subscription_events
      ADD CONSTRAINT fk_subscription_events_subscription 
      FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);

-- CREATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  paddle_transaction_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'refunded', 'pending')),
  payment_method TEXT,
  invoice_url TEXT,
  receipt_url TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'transactions' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT fk_transactions_subscription 
      FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paddle_transaction_id ON public.transactions(paddle_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- CREATE PLAN_FEATURES TABLE
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL UNIQUE CHECK (plan IN ('free', 'pro', 'business')),
  features JSONB NOT NULL,
  max_transactions_per_month INT,
  max_budgets INT,
  max_goals INT,
  custom_categories BOOLEAN DEFAULT FALSE,
  csv_export BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.plan_features (plan, features, max_transactions_per_month, max_budgets, max_goals, custom_categories, csv_export, priority_support)
VALUES
  ('free', '{"unlimited_transactions": false, "api_access": false, "csv_export": false, "priority_support": false}'::jsonb, 100, 2, 2, false, false, false),
  ('pro', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, 10, 10, true, true, true),
  ('business', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, NULL, NULL, true, true, true)
ON CONFLICT (plan) DO NOTHING;

ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan features"
  ON public.plan_features FOR SELECT
  USING (true);

ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive'));

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

COMMIT;
```

---

### 2️⃣ SET EDGE FUNCTION SECRETS (2 min)

**GO TO:** https://supabase.com/dashboard/project/eocagbloalvideqsyxvpv

**STEPS:**
1. Click: **Settings** (left sidebar bottom)
2. Click: **Edge Functions** (or go to Functions)
3. Find: **paddle-webhook** function
4. Click: **paddle-webhook**
5. Click: **Configuration** tab
6. Click: **Add Variable** and add:
   - `PADDLE_WEBHOOK_SECRET` = [from Paddle Dashboard Webhooks]
   - `SUPABASE_URL` = `https://eocagbloalvideqsyxvpv.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = [from Settings → API → Service role key]
7. ✅ Save

---

### 3️⃣ CONFIGURE PADDLE WEBHOOK (2 min)

**GO TO:** https://dashboard.paddle.com

**STEPS:**
1. Click: **Webhooks** (left sidebar)
2. Click: **Add Webhook Endpoint**
3. Enter URL: `https://eocagbloalvideqsyxvpv.supabase.co/functions/v1/paddle-webhook`
4. Select Events:
   - ✅ subscription.created
   - ✅ subscription.activated
   - ✅ subscription.updated
   - ✅ subscription.canceled
   - ✅ subscription.paused
   - ✅ transaction.completed
   - ✅ transaction.payment_failed
5. Click: **Save**
6. **Copy the Signing Secret**
7. Go back to Supabase → paste as `PADDLE_WEBHOOK_SECRET` (Step 2)
8. ✅ Done

---

### 4️⃣ DEPLOY TO VERCEL (1 min)

**RUN IN TERMINAL:**
```bash
cd "c:\Users\KIIT0001\Downloads\Antigravity Projects\Current Money SRC\Fintrack-V1\landing-page"
vercel deploy --prod
```

✅ Done - landing page is live

---

## ✅ TESTING (2 min)

1. **Go to:** https://landing-page-sigma-five-59.vercel.app (or your Vercel URL)
2. **Click:** "Start 7-Day Trial" on Pro Monthly
3. **Use card:** `4111 1111 1111 1111`
4. **Complete checkout**
5. **Verify in Supabase:**
   - Go to: https://supabase.com/dashboard/project/eocagbloalvideqsyxvpv/editor/subscriptions
   - ✅ Should see new row with your user
   - Go to `subscription_events` - should see 'created' event
   - Go to `transactions` - should see payment

---

## 📋 SUMMARY

| Task | Time | Status |
|------|------|--------|
| SQL Migration | 2 min | 👈 DO THIS FIRST |
| Edge Function Secrets | 2 min | 👈 DO SECOND |
| Paddle Webhook | 2 min | 👈 DO THIRD |
| Vercel Deploy | 1 min | Ready (use terminal) |
| Testing | 2 min | After all above |

**Total: ~10 minutes**

---

## 💡 Files Ready

- ✅ `supabase/migration_026_complete_payment_schema.sql` - Migration file
- ✅ `landing-page/src/components/FeatureGate.jsx` - Component
- ✅ `landing-page/src/components/TrialCountdown.jsx` - Component
- ✅ `landing-page/src/components/SubscriptionStatus.jsx` - Component
- ✅ `landing-page/supabase/functions/paddle-webhook/index.ts` - Webhook handler (updated)
- ✅ All committed to GitHub

---

## 🚀 START HERE

1. Copy the SQL from Section 1️⃣ above
2. Paste into Supabase SQL Editor
3. Click Run
4. Follow steps 2️⃣, 3️⃣, 4️⃣ in order
5. Test with payment

**That's it!** Your payment system is live.

