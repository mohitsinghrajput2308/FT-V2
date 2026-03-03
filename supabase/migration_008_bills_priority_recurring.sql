-- Migration 008: Add priority and recurring columns to bills table
-- =============================================

-- Add priority column (High / Medium / Low)
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium'
        CHECK (priority IN ('High', 'Medium', 'Low'));

-- Add recurring label column (e.g. 'Monthly', 'Quarterly', 'Yearly', 'One-time')
ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT 'Monthly';

SELECT 'Migration 008 completed — bills.priority and bills.recurring added!' AS status;
