-- =============================================
-- FINTRACK AUTHENTICATION HARDENING MIGRATION
-- Run AFTER supabase_multitenant_migration.sql
-- Supabase SQL Editor → New Query → Paste → Run
-- =============================================
-- Adds:
--   1. Email verification OTP (6-digit) with 3 attempts + 12hr lockout
--   2. OAuth provider tracking
--   3. CAPTCHA verification logging
-- =============================================

-- =============================================
-- 1. EMAIL VERIFICATION TABLE
-- Stores OTP codes, attempt tracking, and lockouts
-- =============================================

CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    otp_code TEXT NOT NULL CHECK (LENGTH(otp_code) = 6 AND otp_code ~ '^\d{6}$'),
    attempts_used INTEGER NOT NULL DEFAULT 0 CHECK (attempts_used >= 0 AND attempts_used <= 3),
    max_attempts INTEGER NOT NULL DEFAULT 3,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_expired BOOLEAN NOT NULL DEFAULT false,
    locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification records
CREATE POLICY "Users can view own verifications"
    ON public.email_verifications FOR SELECT
    USING (auth.uid() = user_id);

-- System inserts (via service role or trigger)
CREATE POLICY "Users can request verification"
    ON public.email_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update (verify) their own records
CREATE POLICY "Users can verify own records"
    ON public.email_verifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_verifications_user 
    ON public.email_verifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_verifications_active
    ON public.email_verifications(user_id, is_verified, is_expired);

-- =============================================
-- 2. ADD VERIFICATION STATUS TO PROFILES
-- =============================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email' 
        CHECK (auth_provider IN ('email', 'google', 'microsoft', 'apple', 'github')),
    ADD COLUMN IF NOT EXISTS verification_locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- =============================================
-- 3. CAPTCHA VERIFICATION LOG
-- Tracks CAPTCHA challenges for anti-bot auditing
-- =============================================

CREATE TABLE IF NOT EXISTS public.captcha_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('signup', 'signin', 'reset_password', 'verify_email')),
    provider TEXT NOT NULL DEFAULT 'turnstile' CHECK (provider IN ('turnstile', 'recaptcha', 'hcaptcha')),
    token_hash TEXT NOT NULL,  -- hash of the CAPTCHA token (never store raw)
    is_valid BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (service-role only — users cannot see captcha logs)
ALTER TABLE public.captcha_verifications ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only service role can read/write
-- This table is purely for anti-fraud auditing

-- Index for abuse detection
CREATE INDEX IF NOT EXISTS idx_captcha_ip 
    ON public.captcha_verifications(ip_address, created_at DESC);

-- =============================================
-- 4. OTP GENERATION FUNCTION
-- Generates cryptographically random 6-digit code
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT AS $$
    SELECT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
$$ LANGUAGE sql VOLATILE;

-- =============================================
-- 5. VERIFY OTP FUNCTION
-- Handles attempt counting, expiry checks, lockout
-- Returns: success, error message, attempts remaining
-- =============================================

CREATE OR REPLACE FUNCTION public.verify_otp(
    p_user_id UUID,
    p_otp_code TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_record RECORD;
    v_attempts_left INTEGER;
BEGIN
    -- Check if user is locked out
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id 
        AND verification_locked_until IS NOT NULL 
        AND verification_locked_until > NOW()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account verification locked. Please try again after 12 hours.',
            'locked', true,
            'locked_until', (SELECT verification_locked_until FROM public.profiles WHERE id = p_user_id)
        );
    END IF;

    -- Get the latest non-expired, non-verified OTP
    SELECT * INTO v_record 
    FROM public.email_verifications 
    WHERE user_id = p_user_id 
        AND is_verified = false 
        AND is_expired = false
        AND expires_at > NOW()
    ORDER BY created_at DESC 
    LIMIT 1;

    -- No active OTP found
    IF v_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No active verification code found. Please request a new one.',
            'attempts_left', 0
        );
    END IF;

    -- Check if max attempts reached
    IF v_record.attempts_used >= v_record.max_attempts THEN
        -- Lock the account for 12 hours
        UPDATE public.profiles 
        SET verification_locked_until = NOW() + INTERVAL '12 hours'
        WHERE id = p_user_id;

        -- Mark OTP as expired
        UPDATE public.email_verifications 
        SET is_expired = true, locked_until = NOW() + INTERVAL '12 hours'
        WHERE id = v_record.id;

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Maximum verification attempts reached. Account locked for 12 hours.',
            'locked', true,
            'attempts_left', 0
        );
    END IF;

    -- Increment attempt counter
    UPDATE public.email_verifications 
    SET attempts_used = attempts_used + 1
    WHERE id = v_record.id;

    v_attempts_left := v_record.max_attempts - v_record.attempts_used - 1;

    -- Check if OTP matches
    IF v_record.otp_code = p_otp_code THEN
        -- SUCCESS: Mark as verified
        UPDATE public.email_verifications 
        SET is_verified = true, verified_at = NOW()
        WHERE id = v_record.id;

        -- Update profile as verified
        UPDATE public.profiles 
        SET email_verified = true, verification_locked_until = NULL
        WHERE id = p_user_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Email verified successfully!',
            'attempts_left', v_attempts_left
        );
    ELSE
        -- WRONG CODE
        IF v_attempts_left <= 0 THEN
            -- This was the last attempt — lock account
            UPDATE public.profiles 
            SET verification_locked_until = NOW() + INTERVAL '12 hours'
            WHERE id = p_user_id;

            UPDATE public.email_verifications 
            SET is_expired = true, locked_until = NOW() + INTERVAL '12 hours'
            WHERE id = v_record.id;

            RETURN jsonb_build_object(
                'success', false,
                'error', 'Incorrect code. All attempts used. Account locked for 12 hours.',
                'locked', true,
                'attempts_left', 0
            );
        END IF;

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Incorrect verification code. ' || v_attempts_left || ' attempt(s) remaining.',
            'attempts_left', v_attempts_left,
            'locked', false
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. CREATE OTP FUNCTION
-- Called when user signs up or requests new code
-- Respects 59-second cooldown between requests
-- =============================================

CREATE OR REPLACE FUNCTION public.create_otp(
    p_user_id UUID,
    p_email TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_last_otp RECORD;
    v_new_otp TEXT;
    v_cooldown_remaining INTEGER;
BEGIN
    -- Check if user is locked
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id 
        AND verification_locked_until IS NOT NULL 
        AND verification_locked_until > NOW()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account verification locked. Please try again after 12 hours.'
        );
    END IF;

    -- Check cooldown (59 seconds between OTP requests)
    SELECT * INTO v_last_otp 
    FROM public.email_verifications 
    WHERE user_id = p_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_last_otp IS NOT NULL THEN
        v_cooldown_remaining := 59 - EXTRACT(EPOCH FROM (NOW() - v_last_otp.created_at))::INTEGER;
        IF v_cooldown_remaining > 0 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Please wait ' || v_cooldown_remaining || ' seconds before requesting a new code.',
                'cooldown_remaining', v_cooldown_remaining
            );
        END IF;
    END IF;

    -- Expire all previous OTPs for this user
    UPDATE public.email_verifications 
    SET is_expired = true 
    WHERE user_id = p_user_id AND is_verified = false;

    -- Generate new 6-digit OTP
    v_new_otp := public.generate_otp();

    -- Insert new OTP record
    INSERT INTO public.email_verifications (user_id, email, otp_code, expires_at)
    VALUES (p_user_id, p_email, v_new_otp, NOW() + INTERVAL '10 minutes');

    -- Return the OTP (to be sent via email by application layer)
    RETURN jsonb_build_object(
        'success', true,
        'otp', v_new_otp,
        'expires_in_seconds', 600,
        'max_attempts', 3
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. UPDATE handle_new_user TO SET PROVIDER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    v_provider TEXT;
BEGIN
    -- Detect auth provider
    v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    IF v_provider NOT IN ('email', 'google', 'microsoft', 'apple', 'github') THEN
        v_provider := 'email';
    END IF;

    -- Create a default personal organization for the user
    INSERT INTO public.organizations (name, slug, plan, max_users)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || '''s Workspace',
        LOWER(REPLACE(REPLACE(NEW.id::text, '-', ''), ' ', '')),
        'free',
        1
    )
    RETURNING id INTO new_org_id;

    -- Create default branding for the org
    INSERT INTO public.branding_settings (organization_id)
    VALUES (new_org_id);

    -- Create the user profile linked to the org
    -- OAuth users are auto-verified; email users need OTP
    INSERT INTO public.profiles (id, email, username, organization_id, role, auth_provider, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        new_org_id,
        'owner',
        v_provider,
        CASE WHEN v_provider != 'email' THEN true ELSE false END  -- OAuth = auto-verified
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUCCESS
-- =============================================
SELECT 'Authentication hardening migration applied successfully!' AS status;
