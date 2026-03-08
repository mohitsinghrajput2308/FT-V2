-- =============================================
-- FINTRACK MIGRATION 013
-- Makes forgot-password username lookup case-SENSITIVE.
-- DB now stores correct case (Mks12), so only exact case should match.
-- =============================================

-- 1. get_security_question() — case-sensitive (trim only, no lower)
CREATE OR REPLACE FUNCTION public.get_security_question(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_question TEXT;
    v_exists   BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.profiles
        WHERE trim(username) = trim(p_username)
    ) INTO v_exists;

    IF NOT v_exists THEN
        RETURN NULL;
    END IF;

    SELECT security_question INTO v_question
    FROM public.profiles
    WHERE trim(username) = trim(p_username)
    LIMIT 1;

    IF v_question IS NULL OR trim(v_question) = '' THEN
        RETURN '__not_set__';
    END IF;

    RETURN v_question;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_security_question(TEXT) TO anon, authenticated;

-- 2. verify_security_answer_get_email() — case-sensitive username, case-insensitive answer
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
    WHERE  trim(username) = trim(p_username)
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
