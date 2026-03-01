-- Migration: Add contact_submissions table
-- Date: 2026-03-03

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email       TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 254),
  subject     TEXT        CHECK (char_length(subject) <= 300),
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status      TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (logged-in or anonymous) to INSERT
CREATE POLICY "Allow public insert"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can read/update/delete (admin access only)
-- No SELECT policy for anon/authenticated — submissions are write-only from client.

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON public.contact_submissions (status);
