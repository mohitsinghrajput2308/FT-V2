-- ============================================================
-- Migration 003: Server-Side Validation (Defense-in-Depth)
--
-- Even if a malicious client bypasses the frontend validation,
-- these database constraints will reject bad data at the
-- PostgreSQL level. This is the last line of defense.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. TRANSACTIONS — validate type, amount, date
-- ────────────────────────────────────────────────
ALTER TABLE transactions
  ADD CONSTRAINT chk_transaction_type
    CHECK (type IN ('income', 'expense')),
  ADD CONSTRAINT chk_transaction_amount
    CHECK (amount > 0 AND amount < 1000000000),
  ADD CONSTRAINT chk_transaction_description_length
    CHECK (char_length(description) <= 500),
  ADD CONSTRAINT chk_transaction_category_length
    CHECK (char_length(category) <= 50);

-- ────────────────────────────────────────────────
-- 2. BUDGETS — validate amount
-- ────────────────────────────────────────────────
ALTER TABLE budgets
  ADD CONSTRAINT chk_budget_amount
    CHECK (amount > 0 AND amount < 1000000000),
  ADD CONSTRAINT chk_budget_category_length
    CHECK (char_length(category) <= 50);

-- ────────────────────────────────────────────────
-- 3. GOALS — validate amounts and name
-- ────────────────────────────────────────────────
ALTER TABLE goals
  ADD CONSTRAINT chk_goal_target_amount
    CHECK (target_amount > 0 AND target_amount < 1000000000),
  ADD CONSTRAINT chk_goal_current_amount
    CHECK (current_amount >= 0),
  ADD CONSTRAINT chk_goal_current_lte_target
    CHECK (current_amount <= target_amount),
  ADD CONSTRAINT chk_goal_name_length
    CHECK (char_length(name) BETWEEN 1 AND 100);

-- ────────────────────────────────────────────────
-- 4. INVESTMENTS — validate positive values
-- ────────────────────────────────────────────────
ALTER TABLE investments
  ADD CONSTRAINT chk_investment_quantity
    CHECK (quantity > 0),
  ADD CONSTRAINT chk_investment_purchase_price
    CHECK (purchase_price >= 0);

-- ────────────────────────────────────────────────
-- 5. BILLS — validate amount and name
-- ────────────────────────────────────────────────
ALTER TABLE bills
  ADD CONSTRAINT chk_bill_amount
    CHECK (amount > 0 AND amount < 1000000000),
  ADD CONSTRAINT chk_bill_name_length
    CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT chk_bill_recurrence
    CHECK (recurrence IS NULL OR recurrence IN ('weekly', 'monthly', 'yearly'));

-- ────────────────────────────────────────────────
-- 6. CATEGORIES — validate name length and type
-- ────────────────────────────────────────────────
ALTER TABLE categories
  ADD CONSTRAINT chk_category_type
    CHECK (type IN ('income', 'expense')),
  ADD CONSTRAINT chk_category_name_length
    CHECK (char_length(name) BETWEEN 1 AND 50);

-- ────────────────────────────────────────────────
-- 7. USER_SETTINGS — validate currency and format
-- ────────────────────────────────────────────────
ALTER TABLE user_settings
  ADD CONSTRAINT chk_settings_currency_length
    CHECK (char_length(currency) <= 5),
  ADD CONSTRAINT chk_settings_date_format
    CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'));

-- ============================================================
-- DONE! These constraints enforce data integrity at the DB level.
-- If any INSERT/UPDATE violates these rules, PostgreSQL will
-- reject it with an error — even if the client validation is
-- bypassed entirely.
-- ============================================================
