-- =============================================
-- FINTRACK MIGRATION 010
-- Adds date_of_birth, gender, and profile-edit
-- rate-limiting columns to the profiles table.
-- Run this in Supabase SQL Editor.
-- =============================================

-- 1. Add new columns to profiles (idempotent) ──────────────────────────────

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender TEXT CHECK (
        gender IN ('male','female','non_binary','prefer_not_to_say')
    ),
    -- Counts how many DOB/gender edits the user has made in the current window
    ADD COLUMN IF NOT EXISTS profile_change_count  INTEGER NOT NULL DEFAULT 0,
    -- Start of the current 30-day window (set on first edit within each window)
    ADD COLUMN IF NOT EXISTS profile_change_window_start TIMESTAMPTZ;

-- 2. Update handle_new_user() to also store DOB/gender from signup metadata ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_dob  TEXT;
    parsed_dob DATE;
    raw_gender TEXT;
BEGIN
    -- Read optional fields from signup metadata
    raw_dob    := NEW.raw_user_meta_data->>'date_of_birth';
    raw_gender := NEW.raw_user_meta_data->>'gender';

    -- Safely parse DOB (ignore if invalid)
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
        gender
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
        END
    )
    ON CONFLICT (id) DO UPDATE
        SET full_name     = EXCLUDED.full_name,
            date_of_birth = EXCLUDED.date_of_birth,
            gender        = EXCLUDED.gender;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (drop first to apply updated function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS — allow users to read their own profile ───────────────────────────
-- (policies may already exist; use DO block to avoid duplicate errors)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'profiles'
          AND policyname = 'Users can view their own profile'
    ) THEN
        EXECUTE $p$
            CREATE POLICY "Users can view their own profile"
                ON public.profiles FOR SELECT
                USING (auth.uid() = id);
        $p$;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'profiles'
          AND policyname = 'Users can update their own profile'
    ) THEN
        EXECUTE $p$
            CREATE POLICY "Users can update their own profile"
                ON public.profiles FOR UPDATE
                USING (auth.uid() = id);
        $p$;
    END IF;
END;
$$;

-- 4. Backend-enforced rate-limit function for DOB / gender updates ─────────
--
--  Rules:
--    • The "window" is 30 days from the account-creation date, rolling.
--      e.g. account created Feb 15 → windows are Feb 15-Mar 16, Mar 16-Apr 15, …
--    • Max 3 changes per window.
--    • Calling the function after the window expires resets the counter.
--
--  Returns JSON: { "ok": true } on success, raises an exception on failure.

CREATE OR REPLACE FUNCTION public.update_dob_gender(
    p_dob    DATE,
    p_gender TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id   UUID := auth.uid();
    v_created   TIMESTAMPTZ;
    v_now       TIMESTAMPTZ := NOW();
    v_prof      public.profiles%ROWTYPE;
    v_window_n  BIGINT;          -- which 30-day window we are in (0-indexed)
    v_win_start TIMESTAMPTZ;     -- computed start of current window
BEGIN
    -- Must be authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate gender value
    IF p_gender IS NOT NULL AND p_gender NOT IN ('male','female','non_binary','prefer_not_to_say') THEN
        RAISE EXCEPTION 'Invalid gender value';
    END IF;

    -- Validate DOB (must not be in the future, must be reasonable)
    IF p_dob IS NOT NULL THEN
        IF p_dob > CURRENT_DATE THEN
            RAISE EXCEPTION 'Date of birth cannot be in the future';
        END IF;
        IF p_dob < '1900-01-01'::DATE THEN
            RAISE EXCEPTION 'Date of birth is too far in the past';
        END IF;
    END IF;

    -- Fetch account creation timestamp
    SELECT created_at INTO v_created FROM auth.users WHERE id = v_user_id;

    -- Fetch current profile row
    SELECT * INTO v_prof FROM public.profiles WHERE id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Determine which 30-day window we are currently in
    v_window_n  := FLOOR(EXTRACT(EPOCH FROM (v_now - v_created)) / (30 * 86400))::BIGINT;
    v_win_start := v_created + (v_window_n * INTERVAL '30 days');

    -- If the stored window start is from a previous window, reset the counter
    IF v_prof.profile_change_window_start IS NULL
       OR v_prof.profile_change_window_start < v_win_start
    THEN
        UPDATE public.profiles
           SET profile_change_count       = 0,
               profile_change_window_start = v_win_start
         WHERE id = v_user_id;

        -- Re-read fresh count
        v_prof.profile_change_count := 0;
    END IF;

    -- Enforce 3-per-window limit
    IF v_prof.profile_change_count >= 3 THEN
        RAISE EXCEPTION 'Monthly edit limit reached. You can update Date of Birth and Gender a maximum of 3 times per 30-day period.';
    END IF;

    -- Apply the update and increment counter atomically
    UPDATE public.profiles
       SET date_of_birth              = COALESCE(p_dob,    date_of_birth),
           gender                     = COALESCE(p_gender, gender),
           profile_change_count       = profile_change_count + 1,
           profile_change_window_start = COALESCE(profile_change_window_start, v_win_start)
     WHERE id = v_user_id;

    RETURN json_build_object('ok', true);
END;
$$;

-- Grant execute to authenticated users
REVOKE ALL ON FUNCTION public.update_dob_gender(DATE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_dob_gender(DATE, TEXT) TO authenticated;

-- 5. Helper: read profile data including rate-limit info ──────────────────
--
--  Returns a single row with DOB, gender, username, and remaining edits.

CREATE OR REPLACE FUNCTION public.get_profile_identity()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id   UUID := auth.uid();
    v_created   TIMESTAMPTZ;
    v_now       TIMESTAMPTZ := NOW();
    v_prof      public.profiles%ROWTYPE;
    v_window_n  BIGINT;
    v_win_start TIMESTAMPTZ;
    v_count     INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT created_at INTO v_created FROM auth.users WHERE id = v_user_id;
    SELECT * INTO v_prof FROM public.profiles WHERE id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    v_window_n  := FLOOR(EXTRACT(EPOCH FROM (v_now - v_created)) / (30 * 86400))::BIGINT;
    v_win_start := v_created + (v_window_n * INTERVAL '30 days');

    -- Effective count (reset if in new window)
    IF v_prof.profile_change_window_start IS NULL
       OR v_prof.profile_change_window_start < v_win_start
    THEN
        v_count := 0;
    ELSE
        v_count := v_prof.profile_change_count;
    END IF;

    RETURN json_build_object(
        'username',         v_prof.username,
        'date_of_birth',    v_prof.date_of_birth,
        'gender',           v_prof.gender,
        'change_count',     v_count,
        'changes_remaining', GREATEST(0, 3 - v_count),
        'window_start',     v_win_start,
        'window_end',       v_win_start + INTERVAL '30 days'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_profile_identity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_identity() TO authenticated;
