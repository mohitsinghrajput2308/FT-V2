-- =============================================
-- FINTRACK MIGRATION 014
-- Add UNIQUE constraint on username in profiles table
-- Enforce username uniqueness at database level
-- =============================================

ALTER TABLE public.profiles
ADD CONSTRAINT unique_username UNIQUE (username);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username
ON public.profiles(username);
