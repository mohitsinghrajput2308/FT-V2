-- =====================================================================
-- COMPLETE PAYMENT SCHEMA MIGRATION
-- =====================================================================
-- This migration enhances the subscriptions table and creates supporting tables
-- for comprehensive payment and subscription lifecycle management

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 1. ALTER SUBSCRIPTIONS TABLE - Add missing columns
-- ─────────────────────────────────────────────────────────────────────
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

-- Ensure status column has correct values
ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused'));

-- ─────────────────────────────────────────────────────────────────────
-- 2. CREATE SUBSCRIPTION_EVENTS TABLE (audit trail)
-- ─────────────────────────────────────────────────────────────────────
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

-- Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for subscription_events
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);

-- ─────────────────────────────────────────────────────────────────────
-- 3. CREATE TRANSACTIONS TABLE (payment history)
-- ─────────────────────────────────────────────────────────────────────
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

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paddle_transaction_id ON public.transactions(paddle_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- ─────────────────────────────────────────────────────────────────────
-- 4. CREATE PLAN_FEATURES TABLE (feature matrix)
-- ─────────────────────────────────────────────────────────────────────
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

-- Populate plan_features with default data
INSERT INTO public.plan_features (plan, features, max_transactions_per_month, max_budgets, max_goals, custom_categories, csv_export, priority_support)
VALUES
  ('free', '{"unlimited_transactions": false, "api_access": false, "csv_export": false, "priority_support": false}'::jsonb, 100, 2, 2, false, false, false),
  ('pro', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, 10, 10, true, true, true),
  ('business', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, NULL, NULL, true, true, true)
ON CONFLICT (plan) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 5. Add subscription-related columns to users table if not exists
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive'));

-- Update existing subscriptions indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

COMMIT;
