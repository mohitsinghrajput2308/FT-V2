-- =============================================
-- FINTRACK MIGRATION 011
-- Fixes security Q&A not being stored in profiles table.
-- Migration 010 rewrote handle_new_user() without the
-- security Q&A columns from supabase_forgot_password.sql.
-- =============================================

-- 1. Backfill existing users: copy security Q&A from auth metadata → profiles
--    (only updates rows where profiles.security_question IS NULL)
UPDATE public.profiles p
SET
    security_question = u.raw_user_meta_data->>'security_question',
    security_answer   = lower(trim(u.raw_user_meta_data->>'security_answer'))
FROM auth.users u
WHERE p.id = u.id
  AND p.security_question IS NULL
  AND (u.raw_user_meta_data->>'security_question') IS NOT NULL
  AND (u.raw_user_meta_data->>'security_question') <> '';

-- 2. Fix handle_new_user() to include ALL fields going forward
--    (merges migration_010 DOB/gender logic + supabase_forgot_password security Q&A)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_dob    TEXT;
    parsed_dob DATE;
    raw_gender TEXT;
BEGIN
    raw_dob    := NEW.raw_user_meta_data->>'date_of_birth';
    raw_gender := NEW.raw_user_meta_data->>'gender';

    BEGIN
        parsed_dob := raw_dob::DATE;
    EXCEPTION WHEN OTHERS THEN
        parsed_dob := NULL;
    END;

    INSERT INTO public.profiles (
        id,
        email,
        username,
        full_name,
        date_of_birth,
        gender,
        security_question,
        security_answer
    )
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        )),
        NEW.raw_user_meta_data->>'full_name',
        parsed_dob,
        CASE
            WHEN raw_gender IN ('male','female','non_binary','prefer_not_to_say')
            THEN raw_gender
            ELSE NULL
        END,
        NEW.raw_user_meta_data->>'security_question',
        LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'security_answer', '')))
    )
    ON CONFLICT (id) DO UPDATE
        SET full_name         = EXCLUDED.full_name,
            date_of_birth     = EXCLUDED.date_of_birth,
            gender            = EXCLUDED.gender,
            security_question = EXCLUDED.security_question,
            security_answer   = EXCLUDED.security_answer;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Update get_security_question() to return a sentinel '__not_set__'
--    when the user EXISTS but has no security question.
--    This lets the frontend give a helpful message instead of "no account found".
CREATE OR REPLACE FUNCTION public.get_security_question(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_question TEXT;
    v_exists   BOOLEAN;
BEGIN
    -- Check if user exists at all
    SELECT EXISTS(
        SELECT 1 FROM public.profiles
        WHERE lower(trim(username)) = lower(trim(p_username))
    ) INTO v_exists;

    IF NOT v_exists THEN
        RETURN NULL;   -- truly no account → frontend shows "no account found"
    END IF;

    -- User exists — get their question (may be NULL)
    SELECT security_question INTO v_question
    FROM public.profiles
    WHERE lower(trim(username)) = lower(trim(p_username))
    LIMIT 1;

    IF v_question IS NULL OR trim(v_question) = '' THEN
        RETURN '__not_set__';  -- account found but no Q set
    END IF;

    RETURN v_question;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_security_question(TEXT) TO anon, authenticated;
