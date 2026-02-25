-- ============================================================
-- Migration 004: Fix RLS on investments table
--
-- Supabase Security Advisor flags: "RLS Disabled in Public"
-- for public.investments. This migration enables RLS and
-- adds proper user-scoped policies.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Enable RLS on investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Step 2: Users can only SELECT their own investments
CREATE POLICY "Users can view their own investments"
ON public.investments
FOR SELECT
USING (auth.uid() = user_id);

-- Step 3: Users can INSERT their own investments
CREATE POLICY "Users can insert their own investments"
ON public.investments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 4: Users can UPDATE their own investments
CREATE POLICY "Users can update their own investments"
ON public.investments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Users can DELETE their own investments
CREATE POLICY "Users can delete their own investments"
ON public.investments
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- DONE. Re-run the Security Advisor to confirm the error is gone.
-- ============================================================
