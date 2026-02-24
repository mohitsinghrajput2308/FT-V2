-- =============================================
-- Run this in Supabase SQL Editor
-- Forgot Password & Rate Limiting Support
-- =============================================

-- 1. Add security question/answer columns to profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS security_question TEXT,
    ADD COLUMN IF NOT EXISTS security_answer   TEXT;

-- 2. Update handle_new_user trigger to save security Q&A from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, security_question, security_answer)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'security_question',
        NEW.raw_user_meta_data->>'security_answer'
    )
    ON CONFLICT (id) DO UPDATE SET
        security_question = EXCLUDED.security_question,
        security_answer   = EXCLUDED.security_answer;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Password reset log (tracks all resets for rate limiting)
CREATE TABLE IF NOT EXISTS public.password_reset_log (
    id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT        NOT NULL,
    reset_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.password_reset_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for all" ON public.password_reset_log FOR INSERT WITH CHECK (true);

-- 4. RPC: get security question by username (anon callable)
CREATE OR REPLACE FUNCTION public.get_security_question(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT security_question FROM public.profiles
        WHERE lower(trim(username)) = lower(trim(p_username))
        LIMIT 1
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_security_question(TEXT) TO anon, authenticated;

-- 5. RPC: verify security answer and return email (anon callable)
CREATE OR REPLACE FUNCTION public.verify_security_answer_get_email(p_username TEXT, p_answer TEXT)
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

-- 6. RPC: check password reset rate limit — max 3 per 7 days
CREATE OR REPLACE FUNCTION public.check_reset_rate_limit(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_count        INT;
    v_next_allowed TIMESTAMPTZ;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.password_reset_log
    WHERE user_email = p_email
      AND reset_at > NOW() - INTERVAL '7 days';

    IF v_count >= 3 THEN
        SELECT reset_at + INTERVAL '7 days' INTO v_next_allowed
        FROM   public.password_reset_log
        WHERE  user_email = p_email
          AND  reset_at > NOW() - INTERVAL '7 days'
        ORDER  BY reset_at ASC
        LIMIT  1;

        RETURN json_build_object(
            'allowed',       false,
            'count',         v_count,
            'next_allowed',  v_next_allowed
        );
    END IF;

    RETURN json_build_object('allowed', true, 'count', v_count, 'next_allowed', null);
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_reset_rate_limit(TEXT) TO anon, authenticated;
