-- ============================================================
-- Migration 019: Contact Submissions & Newsletter Fixes
-- ============================================================
-- This migration fills the gap between 018 and 020.
-- It brings the root scripts into 100% sync with the live database
-- by consolidating the scattered CLI migrations.

-- ============================================================
-- 1. CONTACT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email       TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 254),
  subject     TEXT        CHECK (char_length(subject) <= 300),
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status      TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for contact_submissions are handled/fixed in migration_018
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON public.contact_submissions (status);

-- ============================================================
-- 3. NEWSLETTER RLS FIX
-- ============================================================
DROP POLICY IF EXISTS "Allow anon insert" ON public.newsletter_subscribers;

CREATE POLICY "Allow anon insert with valid email"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254
    AND source IN ('footer', 'hero', 'cta', 'blog')
  );

DROP POLICY IF EXISTS "Allow anon select" ON public.newsletter_subscribers;

CREATE POLICY "Allow authenticated select own row"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- ============================================================
-- 4. NEWSLETTER Edge Function Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_newsletter_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://eocagbloalvidegyxvpv.supabase.co/functions/v1/send-newsletter-welcome',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    ),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_newsletter_subscriber_insert ON public.newsletter_subscribers;

CREATE TRIGGER on_newsletter_subscriber_insert
  AFTER INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_newsletter_welcome();

-- SUCCESS
SELECT 'Migration 019 completed — Missing features applied' AS status;
