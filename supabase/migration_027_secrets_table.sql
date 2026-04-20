-- Create secrets table to store edge function secrets
-- This is a workaround since Supabase doesn't expose an API to set environment variables

CREATE TABLE IF NOT EXISTS public.edge_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_name TEXT NOT NULL UNIQUE,
  secret_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.edge_secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (no one else)
CREATE POLICY "Service role only" ON public.edge_secrets
  FOR ALL USING (false);

-- Insert the secrets
INSERT INTO public.edge_secrets (secret_name, secret_value) VALUES
  ('SUPABASE_URL', 'https://eocagbloalvideqsyxvpv.supabase.co'),
  ('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY2FnYmxvYWx2aWRlcXN5eHZwdiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.SERVICE_ROLE_KEY'),
  ('PADDLE_WEBHOOK_SECRET', 'PENDING_FROM_PADDLE')
ON CONFLICT (secret_name) DO UPDATE SET secret_value = EXCLUDED.secret_value;

-- Create index
CREATE INDEX IF NOT EXISTS idx_edge_secrets_name ON public.edge_secrets(secret_name);
