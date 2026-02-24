-- =============================================
-- FINTRACK: SERVER-SIDE MFA FACTOR REMOVAL
-- Run this in Supabase SQL Editor
-- =============================================

CREATE OR REPLACE FUNCTION public.remove_user_mfa_factors()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Delete all MFA factors for the current authenticated user from Supabase's auth schema
    DELETE FROM auth.mfa_factors
    WHERE user_id = auth.uid();

    -- Try to clean up totp_secrets if the table exists (non-fatal if it doesn't)
    BEGIN
        DELETE FROM public.totp_secrets WHERE user_id = auth.uid();
    EXCEPTION
        WHEN undefined_table THEN NULL; -- table doesn't exist, that's fine
        WHEN OTHERS THEN NULL;          -- any other error, ignore
    END;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_user_mfa_factors() TO authenticated;
