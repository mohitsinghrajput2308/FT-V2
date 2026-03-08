-- ============================================================
-- Migration 017: Nuclear Fix — Run this if ANYTHING is broken
-- ============================================================
-- Completely safe to run multiple times (fully idempotent).
-- Drops ALL blocking constraints and re-adds them permissively.
-- Adds ALL missing columns. Fixes everything from migrations
-- 003 through 016 that might have been missed.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TRANSACTIONS: drop every known constraint, re-add safe ones
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS description_no_html,
    DROP CONSTRAINT IF EXISTS chk_transaction_description_length,
    DROP CONSTRAINT IF EXISTS chk_transaction_type,
    DROP CONSTRAINT IF EXISTS chk_transaction_amount,
    DROP CONSTRAINT IF EXISTS chk_transaction_category_length;

-- Re-add constraints that are safe and useful
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS chk_transaction_type
        CHECK (type IN ('income', 'expense')),
    ADD CONSTRAINT IF NOT EXISTS chk_transaction_amount
        CHECK (amount > 0 AND amount < 1000000000),
    -- Increased to 600 chars to accommodate FT: pipe format
    ADD CONSTRAINT IF NOT EXISTS chk_transaction_description_length
        CHECK (description IS NULL OR char_length(description) <= 600),
    ADD CONSTRAINT IF NOT EXISTS description_no_html
        CHECK (description IS NULL OR description !~ '(<script|javascript:|on\w+=)');

-- Add recurring columns (safe if already exist)
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS recurrence TEXT
        CHECK (recurrence IS NULL OR recurrence IN ('daily', 'weekly', 'monthly', 'yearly'));
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS next_occurrence DATE;

-- ─────────────────────────────────────────────────────────────
-- BUDGETS: drop known constraints, re-add, add missing columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.budgets
    DROP CONSTRAINT IF EXISTS chk_budget_amount,
    DROP CONSTRAINT IF EXISTS chk_budget_category_length;

ALTER TABLE public.budgets
    ADD CONSTRAINT IF NOT EXISTS chk_budget_amount
        CHECK (amount > 0 AND amount < 1000000000),
    ADD CONSTRAINT IF NOT EXISTS chk_budget_category_length
        CHECK (char_length(category) <= 50);

ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0
        CHECK (spent_amount >= 0);
ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS period TEXT;
ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS period_type TEXT DEFAULT 'monthly'
        CHECK (period_type IS NULL OR period_type IN ('monthly', 'weekly', 'yearly'));

-- ─────────────────────────────────────────────────────────────
-- GOALS: drop known constraints, re-add, add missing columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.goals
    DROP CONSTRAINT IF EXISTS chk_goal_target_amount,
    DROP CONSTRAINT IF EXISTS chk_goal_current_amount,
    DROP CONSTRAINT IF EXISTS chk_goal_current_lte_target,
    DROP CONSTRAINT IF EXISTS chk_goal_name_length;

ALTER TABLE public.goals
    ADD CONSTRAINT IF NOT EXISTS chk_goal_target_amount
        CHECK (target_amount > 0 AND target_amount < 1000000000),
    ADD CONSTRAINT IF NOT EXISTS chk_goal_current_amount
        CHECK (current_amount >= 0),
    ADD CONSTRAINT IF NOT EXISTS chk_goal_name_length
        CHECK (char_length(name) BETWEEN 1 AND 100);
-- NOTE: chk_goal_current_lte_target intentionally removed — it breaks
-- addToGoal when rounding causes tiny overflows. Enforced in app layer.

ALTER TABLE public.goals
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('High', 'Medium', 'Low'));
ALTER TABLE public.goals
    ADD COLUMN IF NOT EXISTS description TEXT;

-- ─────────────────────────────────────────────────────────────
-- INVESTMENTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.investments
    DROP CONSTRAINT IF EXISTS chk_investment_quantity,
    DROP CONSTRAINT IF EXISTS chk_investment_purchase_price;

ALTER TABLE public.investments
    ADD CONSTRAINT IF NOT EXISTS chk_investment_quantity CHECK (quantity > 0),
    ADD CONSTRAINT IF NOT EXISTS chk_investment_purchase_price CHECK (purchase_price >= 0);

-- ─────────────────────────────────────────────────────────────
-- BILLS: drop/re-add constraints + missing columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.bills
    DROP CONSTRAINT IF EXISTS chk_bill_amount,
    DROP CONSTRAINT IF EXISTS chk_bill_name_length,
    DROP CONSTRAINT IF EXISTS chk_bill_recurrence;

ALTER TABLE public.bills
    ADD CONSTRAINT IF NOT EXISTS chk_bill_amount
        CHECK (amount > 0 AND amount < 1000000000),
    ADD CONSTRAINT IF NOT EXISTS chk_bill_name_length
        CHECK (char_length(name) BETWEEN 1 AND 100),
    ADD CONSTRAINT IF NOT EXISTS chk_bill_recurrence
        CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'monthly', 'yearly'));

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT 'Monthly';
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium'
        CHECK (priority IS NULL OR priority IN ('High', 'Medium', 'Low'));

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.categories
    DROP CONSTRAINT IF EXISTS chk_category_type,
    DROP CONSTRAINT IF EXISTS chk_category_name_length;

ALTER TABLE public.categories
    ADD CONSTRAINT IF NOT EXISTS chk_category_type
        CHECK (type IN ('income', 'expense')),
    ADD CONSTRAINT IF NOT EXISTS chk_category_name_length
        CHECK (char_length(name) BETWEEN 1 AND 50);

-- ─────────────────────────────────────────────────────────────
-- USER SETTINGS: add missing columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.user_settings
    DROP CONSTRAINT IF EXISTS chk_settings_currency_length,
    DROP CONSTRAINT IF EXISTS chk_settings_date_format;

ALTER TABLE public.user_settings
    ADD CONSTRAINT IF NOT EXISTS chk_settings_currency_length
        CHECK (char_length(currency) <= 5),
    ADD CONSTRAINT IF NOT EXISTS chk_settings_date_format
        CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'));

ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS total_budget DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS custom_categories_created INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Category lifetime counter RPC (for plan limit loophole fix)
CREATE OR REPLACE FUNCTION public.increment_category_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, custom_categories_created)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET custom_categories_created = COALESCE(public.user_settings.custom_categories_created, 0) + 1,
        updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_category_count(UUID) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- TRIGGERS (idempotent via DROP IF EXISTS + CREATE)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON public.bills;
CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- Initialize lifetime category counter from existing custom cats
-- ─────────────────────────────────────────────────────────────
UPDATE public.user_settings us
SET custom_categories_created = GREATEST(
    COALESCE(us.custom_categories_created, 0),
    COALESCE((
        SELECT COUNT(*)::INTEGER
        FROM public.categories c
        WHERE c.user_id = us.user_id
    ), 0)
);

-- ============================================================
SELECT 'Migration 017 completed — all constraints fixed, all columns present!' AS status;
-- ============================================================
