-- Migration: Newsletter welcome email trigger
-- Date: 2026-03-03
--
-- Creates a pg_net trigger that fires after each INSERT to newsletter_subscribers
-- and calls the send-newsletter-welcome Edge Function to deliver a welcome email.
--
-- Prerequisites:
--   1. pg_net extension must be enabled (it is by default on Supabase hosted projects).
--   2. The send-newsletter-welcome Edge Function must be deployed.
--   3. Set RESEND_API_KEY (or SENDGRID_API_KEY) in Supabase dashboard
--      → Project Settings → Edge Functions → Environment Variables.

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
