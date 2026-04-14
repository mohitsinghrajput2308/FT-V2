-- =====================================================
-- Migration: Add subscription tracking to profiles
-- =====================================================
-- This migration:
-- 1. Adds subscription_tier column to profiles
-- 2. Adds is_pro column to profiles
-- 3. Adds paddle payment tracking columns
-- 4. Creates profiles for existing auth.users who don't have one
-- =====================================================

BEGIN;

-- Step 1: Add subscription tracking columns to profiles table
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_plan_name TEXT,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Create profiles for any existing auth.users that don't have a profile
INSERT INTO public.profiles (id, email, username, subscription_tier)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  'free'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
  ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_profiles_paddle_customer_id 
  ON public.profiles(paddle_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_paddle_subscription_id 
  ON public.profiles(paddle_subscription_id);

-- Step 4: View all profiles created
SELECT 
  id,
  email,
  subscription_tier,
  is_pro,
  paddle_subscription_id,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

COMMIT;
