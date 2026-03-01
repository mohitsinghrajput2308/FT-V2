-- Add recurring transaction support
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS next_occurrence DATE;
