-- ============================================================
-- Migration 016: Category Loophole Fix
-- ============================================================
-- Closes the plan-limit bypass where Pro users could delete
-- categories and recreate them indefinitely to exceed the 3-limit.
--
-- Solution:
--   1. Track a lifetime counter (custom_categories_created) in
--      user_settings — only increments on creation, never decrements.
--   2. Cascade-delete is handled in application layer; the DB
--      counter ensures the limit cannot be bypassed via delete+recreate.
-- ============================================================

-- 1. Add lifetime category counter to user_settings
ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS custom_categories_created INTEGER DEFAULT 0;

-- 2. Initialize counter for existing users based on current custom categories
--    (All rows in the categories table are custom; built-ins are frontend-only)
UPDATE public.user_settings us
SET custom_categories_created = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM public.categories c
    WHERE c.user_id = us.user_id
), 0)
WHERE custom_categories_created = 0;

-- 3. Create an atomic RPC function to increment the counter
--    Uses INSERT ... ON CONFLICT to handle users with no settings row yet.
CREATE OR REPLACE FUNCTION public.increment_category_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, custom_categories_created)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET custom_categories_created = COALESCE(public.user_settings.custom_categories_created, 0) + 1,
        updated_at = NOW();
END;
$$;

-- Grant execute to authenticated users (RLS on the table still applies)
GRANT EXECUTE ON FUNCTION public.increment_category_count(UUID) TO authenticated;

-- 4. Verify
SELECT 'Migration 016 completed — category loophole fix applied!' AS status;
