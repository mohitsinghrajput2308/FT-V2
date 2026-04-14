-- Migration: Sync all paid users' subscription_tier based on existing payment data
-- Purpose: Automatically set subscription_tier for all users with existing Paddle subscriptions or is_pro flag

BEGIN;

-- For users with is_pro = true, set to 'pro'
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE is_pro = true 
  AND (subscription_tier IS NULL OR subscription_tier = 'free');

-- For users with paddle_subscription_id, set to appropriate tier based on plan_name or default to 'business'
UPDATE profiles 
SET subscription_tier = CASE 
    WHEN paddle_subscription_id IS NOT NULL THEN 'business'
    ELSE subscription_tier
END
WHERE paddle_subscription_id IS NOT NULL 
  AND (subscription_tier IS NULL OR subscription_tier = 'free');

-- If there's a paddle_customer_id but no subscription_id, they might be a customer - set to 'pro'
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE paddle_customer_id IS NOT NULL 
  AND paddle_subscription_id IS NULL
  AND (subscription_tier IS NULL OR subscription_tier = 'free');

-- Verify results
SELECT 
  id,
  email,
  is_pro,
  paddle_subscription_id,
  paddle_customer_id,
  subscription_tier,
  created_at
FROM profiles
WHERE subscription_tier != 'free'
ORDER BY created_at DESC;

COMMIT;
