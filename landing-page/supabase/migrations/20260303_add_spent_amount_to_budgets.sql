-- Add spent_amount to budgets table to support manual spending tracking
ALTER TABLE public.budgets ADD COLUMN spent_amount DECIMAL(12,2) DEFAULT 0;
