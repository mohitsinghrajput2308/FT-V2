-- Fix: RLS Policy Always True on public.newsletter_subscribers
-- Replaces the overly permissive WITH CHECK (true) INSERT policy
-- with a policy that validates email format before allowing insert.

-- Drop the existing permissive anon insert policy
DROP POLICY IF EXISTS "Allow anon insert" ON public.newsletter_subscribers;

-- Create a restrictive insert policy: only allow valid email format
-- This prevents spam/garbage inserts from anonymous users
CREATE POLICY "Allow anon insert with valid email"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 254  -- RFC 5321 max email length
    AND source IN ('footer', 'hero', 'cta', 'blog')  -- only known sources
  );

-- Also ensure authenticated users can read only their own subscription
DROP POLICY IF EXISTS "Allow anon select" ON public.newsletter_subscribers;

CREATE POLICY "Allow authenticated select own row"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (email = auth.email());
