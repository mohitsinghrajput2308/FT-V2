-- =============================================
-- FINTRACK MULTI-TENANT + RBAC + WHITE-LABEL MIGRATION
-- Run AFTER supabase_schema.sql AND supabase_security_patch.sql
-- Run in Supabase SQL Editor
-- =============================================
-- This migration converts FinTrack from a single-user app
-- into a multi-tenant SaaS framework that can be sold to
-- businesses, accounting firms, and fintech startups.
-- =============================================

-- =============================================
-- 1. ORGANIZATIONS TABLE (Tenants)
-- Each buyer/company gets their own organization.
-- All data is scoped to an organization.
-- =============================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL CHECK (LENGTH(name) <= 100),
    slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9\-]+$' AND LENGTH(slug) <= 50),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
    max_users INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Index for slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- =============================================
-- 2. RBAC — Add role + organization to profiles
-- Roles: owner, admin, manager, member, viewer
-- =============================================

-- Add new columns to profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member' 
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Index for org-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);

-- =============================================
-- 3. ADD organization_id TO ALL DATA TABLES
-- This scopes all data to an organization.
-- =============================================

-- Transactions
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_transactions_org 
    ON public.transactions(organization_id, transaction_date DESC);

-- Budgets
ALTER TABLE public.budgets
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_budgets_org 
    ON public.budgets(organization_id, year, month);

-- Investments
ALTER TABLE public.investments
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_investments_org 
    ON public.investments(organization_id);

-- Audit Logs
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_org 
    ON public.audit_logs(organization_id, created_at DESC);

-- =============================================
-- 4. WHITE-LABEL BRANDING SETTINGS
-- Each organization can customize their branding.
-- =============================================

CREATE TABLE IF NOT EXISTS public.branding_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
    app_name TEXT NOT NULL DEFAULT 'FinTrack' CHECK (LENGTH(app_name) <= 50),
    logo_url TEXT CHECK (LENGTH(logo_url) <= 500),
    favicon_url TEXT CHECK (LENGTH(favicon_url) <= 500),
    primary_color TEXT NOT NULL DEFAULT '#3B82F6' CHECK (primary_color ~ '^#[0-9a-fA-F]{6}$'),
    secondary_color TEXT NOT NULL DEFAULT '#14B8A6' CHECK (secondary_color ~ '^#[0-9a-fA-F]{6}$'),
    accent_color TEXT DEFAULT '#06B6D4' CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9a-fA-F]{6}$'),
    default_currency TEXT NOT NULL DEFAULT 'USD' 
        CHECK (default_currency IN ('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF', 'CNY', 'KRW', 'BRL', 'MXN', 'AED', 'SAR')),
    default_theme TEXT NOT NULL DEFAULT 'dark' CHECK (default_theme IN ('light', 'dark')),
    supported_currencies TEXT[] DEFAULT ARRAY['USD', 'EUR', 'GBP', 'INR'],
    custom_categories JSONB DEFAULT NULL,
    feature_flags JSONB DEFAULT '{
        "investments": true,
        "budgets": true,
        "reports": true,
        "export_csv": true,
        "export_pdf": false,
        "ai_insights": false,
        "multi_currency": true,
        "team_collaboration": false,
        "api_access": false
    }',
    footer_text TEXT DEFAULT '© 2026 FinTrack. All rights reserved.',
    support_email TEXT CHECK (support_email IS NULL OR support_email ~ '^[^@]+@[^@]+\.[^@]+$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. INVITATION SYSTEM (for team management)
-- =============================================

CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    role TEXT NOT NULL DEFAULT 'member' 
        CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON public.invitations(organization_id);

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has at least the given role level
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_levels JSONB := '{"owner": 5, "admin": 4, "manager": 3, "member": 2, "viewer": 1}';
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN (role_levels->>user_role)::int >= (role_levels->>required_role)::int;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- 7. UPDATED RLS POLICIES (Multi-Tenant + RBAC)
-- =============================================

-- === ORGANIZATIONS ===
CREATE POLICY "Users can view their own organization"
    ON public.organizations FOR SELECT
    USING (id = public.get_user_org_id());

CREATE POLICY "Owners and admins can update organization"
    ON public.organizations FOR UPDATE
    USING (id = public.get_user_org_id() AND public.has_role('admin'));

-- === PROFILES (updated for org scope) ===
-- Drop old policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can view all members of their organization
CREATE POLICY "Users can view org members"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid()  -- Always see yourself
        OR organization_id = public.get_user_org_id()  -- See org members
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- Admins can update any profile in their org (role changes etc)
CREATE POLICY "Admins can update org profiles"
    ON public.profiles FOR UPDATE
    USING (
        organization_id = public.get_user_org_id()
        AND public.has_role('admin')
    );

-- === TRANSACTIONS (updated for org + RBAC) ===
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own active transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own deleted transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Members can view all org transactions (team visibility)
CREATE POLICY "Org members can view transactions"
    ON public.transactions FOR SELECT
    USING (
        organization_id = public.get_user_org_id()
        AND deleted_at IS NULL
    );

-- Members+ can insert (viewers cannot)
CREATE POLICY "Members can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (
        organization_id = public.get_user_org_id()
        AND public.has_role('member')
    );

-- Users can update their own; managers+ can update any in org
CREATE POLICY "Users/managers can update transactions"
    ON public.transactions FOR UPDATE
    USING (
        organization_id = public.get_user_org_id()
        AND (auth.uid() = user_id OR public.has_role('manager'))
    );

-- Users can delete their own; admins+ can delete any in org
CREATE POLICY "Users/admins can delete transactions"
    ON public.transactions FOR DELETE
    USING (
        organization_id = public.get_user_org_id()
        AND (auth.uid() = user_id OR public.has_role('admin'))
    );

-- === BUDGETS (org-scoped) ===
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;

CREATE POLICY "Org members can view budgets"
    ON public.budgets FOR SELECT
    USING (organization_id = public.get_user_org_id());

CREATE POLICY "Members can insert budgets"
    ON public.budgets FOR INSERT
    WITH CHECK (organization_id = public.get_user_org_id() AND public.has_role('member'));

CREATE POLICY "Users/managers can update budgets"
    ON public.budgets FOR UPDATE
    USING (organization_id = public.get_user_org_id() AND (auth.uid() = user_id OR public.has_role('manager')));

CREATE POLICY "Users/admins can delete budgets"
    ON public.budgets FOR DELETE
    USING (organization_id = public.get_user_org_id() AND (auth.uid() = user_id OR public.has_role('admin')));

-- === INVESTMENTS (org-scoped) ===
DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;

CREATE POLICY "Org members can view investments"
    ON public.investments FOR SELECT
    USING (organization_id = public.get_user_org_id());

CREATE POLICY "Members can insert investments"
    ON public.investments FOR INSERT
    WITH CHECK (organization_id = public.get_user_org_id() AND public.has_role('member'));

CREATE POLICY "Users/managers can update investments"
    ON public.investments FOR UPDATE
    USING (organization_id = public.get_user_org_id() AND (auth.uid() = user_id OR public.has_role('manager')));

CREATE POLICY "Users/admins can delete investments"
    ON public.investments FOR DELETE
    USING (organization_id = public.get_user_org_id() AND (auth.uid() = user_id OR public.has_role('admin')));

-- === BRANDING SETTINGS ===
CREATE POLICY "Org members can view branding"
    ON public.branding_settings FOR SELECT
    USING (organization_id = public.get_user_org_id());

CREATE POLICY "Admins can update branding"
    ON public.branding_settings FOR UPDATE
    USING (organization_id = public.get_user_org_id() AND public.has_role('admin'));

-- === INVITATIONS ===
CREATE POLICY "Admins can view org invitations"
    ON public.invitations FOR SELECT
    USING (organization_id = public.get_user_org_id() AND public.has_role('admin'));

CREATE POLICY "Admins can create invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (organization_id = public.get_user_org_id() AND public.has_role('admin'));

CREATE POLICY "Admins can revoke invitations"
    ON public.invitations FOR UPDATE
    USING (organization_id = public.get_user_org_id() AND public.has_role('admin'));

-- =============================================
-- 8. AUTO-CREATE ORGANIZATION ON FIRST SIGNUP
-- Updates the handle_new_user trigger to also
-- create a default organization for solo users.
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
BEGIN
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
    INSERT INTO public.profiles (id, email, username, organization_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        new_org_id,
        'owner'  -- First user is always the org owner
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. PLAN LIMITS ENFORCEMENT
-- =============================================

CREATE OR REPLACE FUNCTION public.check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
    org_plan TEXT;
    org_max_users INTEGER;
    current_user_count INTEGER;
BEGIN
    SELECT plan, max_users INTO org_plan, org_max_users
    FROM public.organizations WHERE id = NEW.organization_id;

    -- Check user count limits
    SELECT COUNT(*) INTO current_user_count
    FROM public.profiles WHERE organization_id = NEW.organization_id AND is_active = true;

    IF current_user_count >= org_max_users THEN
        RAISE EXCEPTION 'Organization has reached its user limit (% users on % plan)', 
            org_max_users, org_plan;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to profile inserts (new team members)
DROP TRIGGER IF EXISTS check_plan_on_user_add ON public.profiles;
CREATE TRIGGER check_plan_on_user_add
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.organization_id IS NOT NULL)
    EXECUTE FUNCTION public.check_plan_limits();

-- =============================================
-- 10. UPDATED_AT TRIGGERS FOR NEW TABLES
-- =============================================

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branding_updated_at
    BEFORE UPDATE ON public.branding_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 11. PLAN CONFIGURATION
-- =============================================

-- Default plan limits (used by application logic)
COMMENT ON TABLE public.organizations IS 
'Plan limits: free=1 user, pro=5 users, business=25 users, enterprise=unlimited';

-- =============================================
-- SUCCESS
-- =============================================
SELECT 'Multi-tenant + RBAC + White-label migration applied successfully!' AS status;
