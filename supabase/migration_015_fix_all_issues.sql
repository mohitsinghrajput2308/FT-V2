-- =============================================
-- Migration 015: Fix all missing columns and constraint issues
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- It is safe to run multiple times (all statements use IF NOT EXISTS / IF EXISTS).
-- =============================================

-- ─────────────────────────────────────────────────────────────
-- 1. FIX: Remove overly-strict description_no_html constraint
--    The frontend stores metadata as text in description; the old
--    constraint blocked {} characters, breaking every transaction insert.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS description_no_html;

-- Re-add a less strict version that still blocks actual HTML/script injection
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS description_no_html
        CHECK (description IS NULL OR description !~ '(<script|javascript:|on\w+=)');

-- ─────────────────────────────────────────────────────────────
-- 2. TRANSACTIONS: add recurring-transaction columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS recurrence TEXT
        CHECK (recurrence IS NULL OR recurrence IN ('daily', 'weekly', 'monthly', 'yearly'));

ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS next_occurrence DATE;

-- ─────────────────────────────────────────────────────────────
-- 3. BUDGETS: add spent tracking and period columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0
        CHECK (spent_amount >= 0);

ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS period TEXT;

ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS period_type TEXT DEFAULT 'monthly'
        CHECK (period_type IS NULL OR period_type IN ('monthly', 'weekly', 'yearly'));

-- ─────────────────────────────────────────────────────────────
-- 4. GOALS: add priority and description columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.goals
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('High', 'Medium', 'Low'));

ALTER TABLE public.goals
    ADD COLUMN IF NOT EXISTS description TEXT;

-- ─────────────────────────────────────────────────────────────
-- 5. BILLS: add recurring label and priority columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT 'Monthly';

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium'
        CHECK (priority IS NULL OR priority IN ('High', 'Medium', 'Low'));

-- ─────────────────────────────────────────────────────────────
-- 6. Ensure updated_at triggers exist for all tables
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

SELECT 'Migration 015 completed — all missing columns added, constraint fixed!' AS status;
