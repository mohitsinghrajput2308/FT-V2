-- migration_029_add_email_to_subscriptions.sql
-- Adds an email column to the subscriptions table, positioned right after user_id.
-- PostgreSQL doesn't support INSERT COLUMN AT POSITION natively, so we rebuild the table
-- with the correct column order.

BEGIN;

-- Step 1: Add the email column (will appear at end initially)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Backfill email from auth.users for existing rows
UPDATE public.subscriptions s
SET email = u.email
FROM auth.users u
WHERE s.user_id = u.id
  AND s.email IS NULL;

-- Step 3: Recreate table with correct column order so email appears right after user_id.
-- We do this by creating a new table, copying data, dropping old, renaming new.

CREATE TABLE public.subscriptions_new (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT,                          -- ← right after user_id
  paddle_subscription_id   TEXT,
  paddle_customer_id       TEXT,
  plan                     TEXT        NOT NULL DEFAULT 'free',
  billing_cycle            TEXT        DEFAULT 'monthly',
  status                   TEXT        NOT NULL DEFAULT 'free',
  trial_ends_at            TIMESTAMPTZ,
  current_period_ends_at   TIMESTAMPTZ,
  canceled_at              TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Copy all existing data
INSERT INTO public.subscriptions_new
  (id, user_id, email, paddle_subscription_id, paddle_customer_id, plan,
   billing_cycle, status, trial_ends_at, current_period_ends_at, canceled_at,
   created_at, updated_at)
SELECT
  id, user_id, email, paddle_subscription_id, paddle_customer_id, plan,
  billing_cycle, status, trial_ends_at, current_period_ends_at, canceled_at,
  created_at, updated_at
FROM public.subscriptions;

-- Drop old table (cascades indexes, policies, etc.)
DROP TABLE public.subscriptions CASCADE;

-- Rename new table
ALTER TABLE public.subscriptions_new RENAME TO subscriptions;

-- Recreate unique constraint on user_id (for upsert)
CREATE UNIQUE INDEX subscriptions_user_id_key ON public.subscriptions(user_id);

-- Recreate index on paddle_subscription_id for fast lookups
CREATE INDEX subscriptions_paddle_sub_id_idx ON public.subscriptions(paddle_subscription_id);

-- Recreate updated_at trigger
CREATE OR REPLACE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (webhooks use service role)
CREATE POLICY "subscriptions_service_role_all"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
