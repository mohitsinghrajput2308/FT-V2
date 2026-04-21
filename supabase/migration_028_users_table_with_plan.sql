-- =====================================================================
-- CREATE USERS TABLE WITH PLAN TRACKING
-- =====================================================================

BEGIN;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for current_plan for faster queries
CREATE INDEX IF NOT EXISTS idx_users_current_plan ON public.users(current_plan);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Insert existing auth users if they don't exist in public.users
INSERT INTO public.users (id, email, current_plan, subscription_status)
SELECT id, email, 'free', 'inactive'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

COMMIT;
