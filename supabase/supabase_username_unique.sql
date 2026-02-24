-- =============================================
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add UNIQUE constraint on username in profiles table
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- 2. RPC function to check if a username is available (callable by anon users)
CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE username = p_username
    );
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon, authenticated;
