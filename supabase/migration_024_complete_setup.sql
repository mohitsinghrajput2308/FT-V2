-- =====================================================================
-- COMPLETE MIGRATION: Create subscriptions & support_tickets tables
-- =====================================================================
-- Run this in Supabase SQL Editor to set up Priority Support feature

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 1. CREATE SUBSCRIPTIONS TABLE (for useSubscription hook)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Paddle subscription info
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  paddle_transaction_id TEXT,
  paddle_plan_name TEXT,
  
  -- Subscription status & plan
  plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'paused', 'canceled', 'inactive')),
  
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id 
  ON public.subscriptions(paddle_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan 
  ON public.subscriptions(plan);

-- Create default subscriptions for all existing users
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT 
  u.id,
  'free',
  'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 2. CREATE SUPPORT_TICKETS TABLE (for Priority Support)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Ticket content
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'billing', 'technical', 'feature-request')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Ticket status
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  
  -- Admin response
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.support_tickets;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tickets
CREATE POLICY "Users can insert their own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id 
  ON public.support_tickets(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status 
  ON public.support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at 
  ON public.support_tickets(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 3. VERIFY SETUP
-- ─────────────────────────────────────────────────────────────────────
SELECT 'Subscriptions table' as table_name, COUNT(*) as row_count FROM public.subscriptions
UNION ALL
SELECT 'Support tickets table', COUNT(*) FROM public.support_tickets;

COMMIT;
