-- =============================================
-- FINTRACK SECURITY PATCH
-- Run AFTER supabase_schema.sql
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. INPUT SANITIZATION CONSTRAINTS
-- Adds length limits and pattern validation
-- =============================================

-- Transactions: category length + pattern
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS category_length 
        CHECK (LENGTH(category) <= 50);

ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS description_length 
        CHECK (description IS NULL OR LENGTH(description) <= 500);

-- Block HTML/script injection in text fields
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS description_no_html
        CHECK (description IS NULL OR description !~ '[<>{}]');

-- Prevent future-dated transactions (1 day buffer for timezone)
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS no_future_dates
        CHECK (transaction_date <= CURRENT_DATE + 1);

-- Upper bound on transaction amount
ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS amount_upper_bound
        CHECK (amount <= 999999999.99);

ALTER TABLE public.transactions
    ADD CONSTRAINT IF NOT EXISTS category_format 
        CHECK (category ~ '^[a-zA-Z0-9\s\-&'']+$');

-- Budgets: category constraints
ALTER TABLE public.budgets
    ADD CONSTRAINT IF NOT EXISTS budget_category_length 
        CHECK (LENGTH(category) <= 50);

ALTER TABLE public.budgets
    ADD CONSTRAINT IF NOT EXISTS budget_category_format 
        CHECK (category ~ '^[a-zA-Z0-9\s\-&'']+$');

-- Investments: symbol validation
ALTER TABLE public.investments
    ADD CONSTRAINT IF NOT EXISTS symbol_length 
        CHECK (LENGTH(stock_symbol) <= 20);

ALTER TABLE public.investments
    ADD CONSTRAINT IF NOT EXISTS symbol_format 
        CHECK (stock_symbol ~ '^[A-Z0-9\.\-]+$');

-- Investments: reasonable price bounds
ALTER TABLE public.investments
    ADD CONSTRAINT IF NOT EXISTS purchase_price_bound 
        CHECK (purchase_price <= 99999999.99);

ALTER TABLE public.investments
    ADD CONSTRAINT IF NOT EXISTS current_price_bound 
        CHECK (current_price IS NULL OR current_price <= 99999999.99);

-- Profiles: username validation
ALTER TABLE public.profiles
    ADD CONSTRAINT IF NOT EXISTS username_length 
        CHECK (LENGTH(username) <= 50);

ALTER TABLE public.profiles
    ADD CONSTRAINT IF NOT EXISTS username_format 
        CHECK (username ~ '^[a-zA-Z0-9_\-\s]+$');

-- =============================================
-- 2. AUDIT LOGGING TABLE
-- Tracks security-relevant actions
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (
        LENGTH(action) <= 50 AND action ~ '^[a-z_]+$'
    ),
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own audit logs (client-side logging)
CREATE POLICY "Users can insert own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Index for querying user's audit history
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
    ON public.audit_logs(user_id, created_at DESC);

-- =============================================
-- 3. SOFT DELETE SUPPORT FOR TRANSACTIONS
-- Instead of permanent deletion, mark as deleted
-- =============================================

-- Add deleted_at column (NULL = active, timestamp = soft-deleted)
ALTER TABLE public.transactions 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update RLS to exclude soft-deleted rows from normal SELECT
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own active transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Allow viewing deleted transactions explicitly (for recovery)
CREATE POLICY "Users can view their own deleted transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- =============================================
-- 4. FULL FORENSIC AUDIT TRIGGERS (all sensitive tables)
-- Logs old_data + new_data for INSERT/UPDATE/DELETE
-- =============================================

-- Add old_data and new_data columns to audit_logs
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS old_data JSONB DEFAULT NULL;
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS new_data JSONB DEFAULT NULL;
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS table_name TEXT DEFAULT NULL;
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS record_id UUID DEFAULT NULL;

-- Generic audit function that works on any table
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
        VALUES (
            OLD.user_id,
            TG_TABLE_NAME || '_delete',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (
            NEW.user_id,
            TG_TABLE_NAME || '_update',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
        VALUES (
            NEW.user_id,
            TG_TABLE_NAME || '_create',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all sensitive tables
DROP TRIGGER IF EXISTS audit_on_transaction_delete ON public.transactions;
DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_budgets ON public.budgets;
CREATE TRIGGER audit_budgets
    AFTER INSERT OR UPDATE OR DELETE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

DROP TRIGGER IF EXISTS audit_investments ON public.investments;
CREATE TRIGGER audit_investments
    AFTER INSERT OR UPDATE OR DELETE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- Audit logs are immutable — no updates, no deletes
CREATE POLICY "Audit logs are immutable"
    ON public.audit_logs FOR UPDATE USING (false);

CREATE POLICY "Audit logs cannot be deleted"
    ON public.audit_logs FOR DELETE USING (false);

-- =============================================
-- 5. DATA RETENTION FUNCTION
-- Permanently purge soft-deleted transactions older than 90 days
-- Schedule this via Supabase pg_cron or manual execution
-- =============================================

CREATE OR REPLACE FUNCTION public.purge_deleted_transactions()
RETURNS INTEGER AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM public.transactions 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUCCESS
-- =============================================
SELECT 'FinTrack security patch applied successfully!' AS status;
