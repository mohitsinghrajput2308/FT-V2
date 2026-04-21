-- =====================================================================
-- PRICE ID TO PLAN MAPPING TABLE
-- =====================================================================
-- This table maps Paddle price IDs to our plan types
-- Used by webhook to determine which plan user purchased

CREATE TABLE IF NOT EXISTS public.price_plan_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paddle_price_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  has_trial BOOLEAN DEFAULT FALSE,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Paddle price mappings (replace with your actual price IDs)
INSERT INTO public.price_plan_mapping (paddle_price_id, plan, billing_cycle, has_trial, amount_cents) VALUES
  ('pri_pro_monthly_trial', 'pro', 'monthly', TRUE, 999),      -- PRO Monthly with 7-day trial
  ('pri_pro_monthly', 'pro', 'monthly', FALSE, 999),            -- PRO Monthly no trial
  ('pri_pro_yearly_trial', 'pro', 'yearly', TRUE, 9990),        -- PRO Yearly with 7-day trial
  ('pri_pro_yearly', 'pro', 'yearly', FALSE, 9990),             -- PRO Yearly no trial
  ('pri_business_monthly_trial', 'business', 'monthly', TRUE, 2999),    -- BUSINESS Monthly with 7-day trial
  ('pri_business_monthly', 'business', 'monthly', FALSE, 2999), -- BUSINESS Monthly no trial
  ('pri_business_yearly_trial', 'business', 'yearly', TRUE, 29990),     -- BUSINESS Yearly with 7-day trial
  ('pri_business_yearly', 'business', 'yearly', FALSE, 29990)   -- BUSINESS Yearly no trial
ON CONFLICT (paddle_price_id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.price_plan_mapping ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for webhook to use)
CREATE POLICY "Public read access" ON public.price_plan_mapping
  FOR SELECT USING (TRUE);
