-- =====================================================
-- Migration: Create subscriptions table for Paddle
-- =====================================================
-- This table stores user subscription data from Paddle
-- The useSubscription hook reads from this table

BEGIN;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Paddle subscription info
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  paddle_transaction_id TEXT,
  paddle_plan_name TEXT,
  
  -- Subscription status & plan
  plan VARCHAR(50) NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'trialing', 'paused', 'canceled', 'inactive')),
  
  -- Billing dates
  billing_cycle TEXT,
  renewal_date DATE,
  cancel_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id 
  ON public.subscriptions(paddle_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan 
  ON public.subscriptions(plan);

-- Create default subscriptions for all existing users (if they don't have one)
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT 
  u.id,
  'free',
  'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL
ON CONFLICT DO NOTHING;

-- View all subscriptions
SELECT user_id, plan, status FROM public.subscriptions ORDER BY created_at DESC;

COMMIT;
