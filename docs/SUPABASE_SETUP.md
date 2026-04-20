# SUPABASE SETUP INSTRUCTIONS

## Step 1: Run Database Migrations

Go to Supabase Dashboard → SQL Editor and run this:

```sql
-- COMPLETE PAYMENT SCHEMA MIGRATION
-- This migration enhances the subscriptions table and creates supporting tables

BEGIN;

-- ALTER SUBSCRIPTIONS TABLE - Add missing columns
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
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'renewed', 'canceled', 'payment_failed', 'trial_ended')),
  from_plan TEXT,
  to_plan TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);

-- CREATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
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

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);

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

-- Add columns to users table
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

COMMIT;
```

## Step 2: Set Up Paddle Webhook Secret in Supabase

Go to Supabase Dashboard:
1. Click **Settings** → **Edge Functions**
2. Find the `paddle-webhook` function
3. Go to function settings and add these environment variables:

| Variable | Value |
|----------|-------|
| `PADDLE_WEBHOOK_SECRET` | Your Paddle webhook signing secret (get from Paddle Dashboard → Webhooks → Settings) |
| `SUPABASE_URL` | Your Supabase project URL (https://xxx.supabase.co) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Settings → API |

## Step 3: Configure Paddle Webhooks

1. Go to **Paddle Dashboard** → **Webhooks**
2. Click **Add Webhook Endpoint**
3. Set URL to: `https://your-project.supabase.co/functions/v1/paddle-webhook`
4. Select Events:
   - ✅ subscription.created
   - ✅ subscription.activated
   - ✅ subscription.updated
   - ✅ subscription.canceled
   - ✅ subscription.paused
   - ✅ transaction.completed
   - ✅ transaction.payment_failed

5. Copy the **Signing Secret** and save it to Supabase environment variables

## Step 4: Deploy Updated Code

```bash
# From landing-page directory
cd landing-page

# Deploy updated edge function
supabase functions deploy paddle-webhook

# Or deploy to Vercel
vercel deploy --prod
```

## Step 5: Verify Everything Works

1. Test with a Paddle test card: `4111 1111 1111 1111`
2. Check Supabase → subscriptions table for new records
3. Check subscription_events table for audit trail
4. Check transactions table for payment history
5. Verify users table has current_plan and subscription_status updated

## Troubleshooting

### Webhook not triggering?
- Check Supabase Edge Function logs
- Verify webhook URL is correct
- Confirm signing secret matches Paddle dashboard

### Subscriptions not created?
- Check if user_id is being passed in custom_data from Paddle checkout
- Verify users table exists with auth.users reference

### Features not gating properly?
- Ensure plan_features table is populated
- Check FeatureGate component is being used
- Verify user has subscription with correct plan

