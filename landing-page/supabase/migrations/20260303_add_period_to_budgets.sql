-- Add period_type and period columns to support weekly budgets natively
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS period_type VARCHAR(20) DEFAULT 'monthly';
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS period VARCHAR(20);

-- Backfill period based on existing month/year if period is null
UPDATE public.budgets
SET period = year || '-' || LPAD(month::text, 2, '0')
WHERE period IS NULL;
