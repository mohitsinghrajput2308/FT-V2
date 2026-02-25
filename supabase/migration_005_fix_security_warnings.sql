-- ============================================================
-- Migration 005: Fix Supabase Security Advisor Warnings
--
-- Fixes:
-- 1. Function Search Path Mutable (8 functions)
-- 2. RLS Policy Always True on password_reset_log
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- FIX 1: Set search_path on all mutable functions
-- This prevents search_path injection attacks
-- ────────────────────────────────────────────────────────────

ALTER FUNCTION public.update_updated_at_column()
    SET search_path = public;

ALTER FUNCTION public.get_security_question(text)
    SET search_path = public;

ALTER FUNCTION public.check_user_exists(text)
    SET search_path = public;

ALTER FUNCTION public.verify_security_answer_get_email(text, text)
    SET search_path = public;

ALTER FUNCTION public.check_reset_rate_limit(text)
    SET search_path = public;

ALTER FUNCTION public.check_username_available(text)
    SET search_path = public;

ALTER FUNCTION public.remove_user_mfa_factors(uuid)
    SET search_path = public;

ALTER FUNCTION public.handle_new_user()
    SET search_path = public;

-- ────────────────────────────────────────────────────────────
-- FIX 2: Fix overly permissive RLS policy on password_reset_log
-- Replace the "always true" policy with a user-scoped one
-- ────────────────────────────────────────────────────────────

-- Drop the overly permissive policy first
DROP POLICY IF EXISTS "Allow all" ON public.password_reset_log;
DROP POLICY IF EXISTS "Enable all" ON public.password_reset_log;
DROP POLICY IF EXISTS "password_reset_log_policy" ON public.password_reset_log;

-- Add a secure, user-scoped policy
CREATE POLICY "Users can view their own reset log"
ON public.password_reset_log
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================================
-- DONE. For "Leaked Password Protection":
-- Go to: Supabase Dashboard → Authentication → Settings →
-- Enable "Leaked Password Protection" toggle.
-- ============================================================
