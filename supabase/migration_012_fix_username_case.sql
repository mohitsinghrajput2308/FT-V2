-- =============================================
-- FINTRACK MIGRATION 012
-- Fixes username case issues:
--   1. Update existing user mks12 → Mks12 (system silently lowercased at signup)
--   2. Fix handle_new_user() to preserve username case (remove LOWER wrapper)
--   3. Fix get_security_question() to use case-insensitive lookup
--   4. Fix verify_security_answer_get_email() to use case-insensitive lookup
-- =============================================

-- 1. Fix existing stored username (was lowercased by old signup code)
UPDATE public.profiles
SET username = 'Mks12'
WHERE username = 'mks12';

-- 2. Fix handle_new_user() — preserve original username case, no LOWER()
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
        -- Preserve original case — no LOWER()
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
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

-- 3. Fix get_security_question() — case-insensitive username lookup
CREATE OR REPLACE FUNCTION public.get_security_question(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_question TEXT;
    v_exists   BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.profiles
        WHERE lower(trim(username)) = lower(trim(p_username))
    ) INTO v_exists;

    IF NOT v_exists THEN
        RETURN NULL;
    END IF;

    SELECT security_question INTO v_question
    FROM public.profiles
    WHERE lower(trim(username)) = lower(trim(p_username))
    LIMIT 1;

    IF v_question IS NULL OR trim(v_question) = '' THEN
        RETURN '__not_set__';
    END IF;

    RETURN v_question;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_security_question(TEXT) TO anon, authenticated;

-- 4. Fix verify_security_answer_get_email() — case-insensitive username lookup
CREATE OR REPLACE FUNCTION public.verify_security_answer_get_email(
    p_username TEXT,
    p_answer   TEXT
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_email         TEXT;
    v_stored_answer TEXT;
BEGIN
    SELECT email, security_answer
    INTO   v_email, v_stored_answer
    FROM   public.profiles
    WHERE  lower(trim(username)) = lower(trim(p_username))
    LIMIT  1;

    IF v_stored_answer IS NOT NULL
       AND lower(trim(v_stored_answer)) = lower(trim(p_answer))
    THEN
        RETURN v_email;
    END IF;
    RETURN NULL;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_security_answer_get_email(TEXT, TEXT) TO anon, authenticated;
