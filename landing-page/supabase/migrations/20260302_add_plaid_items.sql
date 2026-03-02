-- Migration: plaid_items table for bank account linking
-- Date: 2026-03-02

CREATE TABLE IF NOT EXISTS public.plaid_items (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id               TEXT        NOT NULL UNIQUE,
  access_token_encrypted TEXT       NOT NULL,  -- server-side only, never returned to client
  institution_id        TEXT,
  institution_name      TEXT,
  linked_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  disconnected_at       TIMESTAMPTZ,
  last_sync_at          TIMESTAMPTZ
);

ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own linked banks
CREATE POLICY "Select own plaid items"
  ON public.plaid_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert/update only via service_role (Edge Function) — no direct client writes
-- No INSERT/UPDATE/DELETE policy for authenticated → Edge Function uses service key

CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON public.plaid_items (user_id);
