-- View Users with their Account Type/Plan
SELECT 
  pu.id,
  pu.email,
  UPPER(pu.current_plan) || ' PLAN' AS "Account Type",
  CASE 
    WHEN pu.current_plan = 'free' THEN 'FREE - NO SUBSCRIPTION'
    WHEN pu.current_plan = 'pro' AND pu.subscription_status = 'active' THEN 'PRO PLAN ONGOING'
    WHEN pu.current_plan = 'business' AND pu.subscription_status = 'active' THEN 'BUSINESS PLAN ONGOING'
    WHEN pu.subscription_status = 'trialing' THEN 'ON TRIAL'
    WHEN pu.subscription_status = 'canceled' THEN 'CANCELED'
    ELSE 'INACTIVE'
  END AS "Status Details",
  pu.created_at AS "Joined",
  s.next_billing_date AS "Next Billing"
FROM public.users pu
LEFT JOIN public.subscriptions s ON pu.id = s.user_id
ORDER BY pu.created_at DESC;
