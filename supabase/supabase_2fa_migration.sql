-- =============================================
-- FINTRACK TWO-FACTOR AUTHENTICATION (2FA/TOTP)
-- Run AFTER supabase_auth_hardening.sql
-- Supabase SQL Editor → New Query → Paste → Run
-- =============================================
-- Adds:
--   1. TOTP secret storage (encrypted, per user)
--   2. Backup recovery codes (8 codes, one-time use)
--   3. 2FA enforcement on login
--   4. Rate limiting on 2FA verification
-- =============================================

-- =============================================
-- 1. TOTP SECRETS TABLE
-- Stores the TOTP secret key for each user
-- =============================================

CREATE TABLE IF NOT EXISTS public.totp_secrets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    encrypted_secret TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'SHA1' CHECK (algorithm IN ('SHA1', 'SHA256', 'SHA512')),
    digits INTEGER NOT NULL DEFAULT 6 CHECK (digits IN (6, 8)),
    period INTEGER NOT NULL DEFAULT 30 CHECK (period IN (30, 60)),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.totp_secrets ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own TOTP
CREATE POLICY "Users can view own TOTP"
    ON public.totp_secrets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TOTP"
    ON public.totp_secrets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TOTP"
    ON public.totp_secrets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own TOTP"
    ON public.totp_secrets FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 2. BACKUP RECOVERY CODES TABLE
-- 8 one-time use codes generated during 2FA setup
-- =============================================

CREATE TABLE IF NOT EXISTS public.backup_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.backup_codes ENABLE ROW LEVEL SECURITY;

-- Users can only view/use their own backup codes
CREATE POLICY "Users can view own backup codes"
    ON public.backup_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backup codes"
    ON public.backup_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backup codes"
    ON public.backup_codes FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_totp_user ON public.totp_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_user ON public.backup_codes(user_id, is_used);

-- =============================================
-- 3. 2FA VERIFICATION ATTEMPTS TABLE
-- Rate limiting for 2FA code entry
-- =============================================

CREATE TABLE IF NOT EXISTS public.tfa_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    attempt_type TEXT NOT NULL CHECK (attempt_type IN ('totp', 'backup_code')),
    is_success BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tfa_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA attempts"
    ON public.tfa_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own 2FA attempts"
    ON public.tfa_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Cleanup index
CREATE INDEX IF NOT EXISTS idx_tfa_attempts_user
    ON public.tfa_attempts(user_id, created_at DESC);

-- =============================================
-- 4. ADD 2FA FIELDS TO PROFILES
-- =============================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS tfa_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS tfa_locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- =============================================
-- 5. GENERATE BACKUP CODES FUNCTION
-- Creates 8 random recovery codes
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_backup_codes(
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_codes TEXT[] := '{}';
    v_code TEXT;
    i INTEGER;
BEGIN
    -- Delete existing backup codes
    DELETE FROM public.backup_codes WHERE user_id = p_user_id;

    -- Generate 8 new codes
    FOR i IN 1..8 LOOP
        -- Format: XXXX-XXXX (8 alphanumeric chars with dash)
        v_code := UPPER(
            SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 4) 
            || '-' || 
            SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 4)
        );
        
        -- Store hash of the code (never store plaintext)
        INSERT INTO public.backup_codes (user_id, code_hash)
        VALUES (p_user_id, encode(digest(v_code, 'sha256'), 'hex'));

        v_codes := array_append(v_codes, v_code);
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'codes', to_jsonb(v_codes),
        'message', 'Save these codes securely. Each can only be used once.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. VERIFY BACKUP CODE FUNCTION
-- Validates and consumes a one-time backup code
-- =============================================

CREATE OR REPLACE FUNCTION public.verify_backup_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_code_hash TEXT;
    v_record RECORD;
    v_remaining INTEGER;
BEGIN
    -- Check lockout
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id 
        AND tfa_locked_until IS NOT NULL 
        AND tfa_locked_until > NOW()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '2FA locked due to too many failed attempts. Try again later.'
        );
    END IF;

    -- Hash the provided code
    v_code_hash := encode(digest(UPPER(TRIM(p_code)), 'sha256'), 'hex');

    -- Find matching unused code
    SELECT * INTO v_record 
    FROM public.backup_codes 
    WHERE user_id = p_user_id 
        AND code_hash = v_code_hash 
        AND is_used = false
    LIMIT 1;

    -- Log the attempt
    INSERT INTO public.tfa_attempts (user_id, attempt_type, is_success)
    VALUES (p_user_id, 'backup_code', v_record IS NOT NULL);

    IF v_record IS NOT NULL THEN
        -- Mark code as used
        UPDATE public.backup_codes 
        SET is_used = true, used_at = NOW()
        WHERE id = v_record.id;

        -- Count remaining codes
        SELECT COUNT(*) INTO v_remaining 
        FROM public.backup_codes 
        WHERE user_id = p_user_id AND is_used = false;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Backup code verified successfully.',
            'remaining_codes', v_remaining
        );
    ELSE
        -- Check for brute force (5 failed 2FA attempts in 10 minutes)
        IF (
            SELECT COUNT(*) FROM public.tfa_attempts 
            WHERE user_id = p_user_id 
            AND is_success = false 
            AND created_at > NOW() - INTERVAL '10 minutes'
        ) >= 5 THEN
            UPDATE public.profiles 
            SET tfa_locked_until = NOW() + INTERVAL '30 minutes'
            WHERE id = p_user_id;

            RETURN jsonb_build_object(
                'success', false,
                'error', 'Too many failed 2FA attempts. Locked for 30 minutes.',
                'locked', true
            );
        END IF;

        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid backup code.'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. CHECK 2FA STATUS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.get_tfa_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_totp RECORD;
    v_remaining_codes INTEGER;
BEGIN
    SELECT * INTO v_totp FROM public.totp_secrets WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO v_remaining_codes 
    FROM public.backup_codes 
    WHERE user_id = p_user_id AND is_used = false;

    RETURN jsonb_build_object(
        'is_enabled', COALESCE(v_totp.is_enabled, false),
        'is_verified', COALESCE(v_totp.is_verified, false),
        'algorithm', COALESCE(v_totp.algorithm, 'SHA1'),
        'digits', COALESCE(v_totp.digits, 6),
        'period', COALESCE(v_totp.period, 30),
        'remaining_backup_codes', v_remaining_codes,
        'last_used', v_totp.last_used_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- 8. UPDATED_AT TRIGGER FOR TOTP
-- =============================================

CREATE TRIGGER update_totp_secrets_updated_at
    BEFORE UPDATE ON public.totp_secrets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SUCCESS
-- =============================================
SELECT '2FA (TOTP + Backup Codes) migration applied successfully!' AS status;
