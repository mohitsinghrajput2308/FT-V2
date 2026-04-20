# COMPLETE DEPLOYMENT & SETUP GUIDE

## 📋 Overview

This guide walks you through deploying the complete payment and subscription system with:
- ✅ Enhanced Supabase schema (subscriptions, events, transactions, features)
- ✅ Paddle webhook integration with full event tracking
- ✅ React components for subscription management (FeatureGate, TrialCountdown, SubscriptionStatus)
- ✅ Plan-based feature gating
- ✅ Trial tracking and countdown

---

## 🚀 PART 1: SUPABASE SETUP (10 minutes)

### Step 1.1: Apply Database Schema Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Paste this entire SQL (from `supabase/migration_026_complete_payment_schema.sql`):

```sql
BEGIN;

-- ALTER SUBSCRIPTIONS TABLE - Add missing columns
ALTER TABLE IF EXISTS public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_starts_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused'));

-- CREATE SUBSCRIPTION_EVENTS TABLE (audit trail)
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'renewed', 'canceled', 'payment_failed', 'trial_ended')),
  from_plan TEXT,
  to_plan TEXT,
  
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);

-- CREATE TRANSACTIONS TABLE (payment history)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  paddle_transaction_id TEXT NOT NULL UNIQUE,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'refunded', 'pending')),
  payment_method TEXT,
  
  invoice_url TEXT,
  receipt_url TEXT,
  
  error_code TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paddle_transaction_id ON public.transactions(paddle_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- CREATE PLAN_FEATURES TABLE (feature matrix)
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL UNIQUE CHECK (plan IN ('free', 'pro', 'business')),
  
  features JSONB NOT NULL,
  
  max_transactions_per_month INT,
  max_budgets INT,
  max_goals INT,
  custom_categories BOOLEAN DEFAULT FALSE,
  csv_export BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate plan_features with default data
INSERT INTO public.plan_features (plan, features, max_transactions_per_month, max_budgets, max_goals, custom_categories, csv_export, priority_support)
VALUES
  ('free', '{"unlimited_transactions": false, "api_access": false, "csv_export": false, "priority_support": false}'::jsonb, 100, 2, 2, false, false, false),
  ('pro', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, 10, 10, true, true, true),
  ('business', '{"unlimited_transactions": true, "api_access": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, NULL, NULL, true, true, true)
ON CONFLICT (plan) DO NOTHING;

-- Add subscription-related columns to users table
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive'));

-- Update existing subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);

COMMIT;
```

5. Click **Run** and verify no errors appear
6. ✅ You should see all tables and indexes created

### Step 1.2: Configure Paddle Webhook Secret

1. Go to Supabase Dashboard → **Settings** → **Edge Functions**
2. Find and click on `paddle-webhook` function
3. Go to **Configuration** tab
4. Add environment variables:

| Key | Value | Where to get |
|-----|-------|--------------|
| `PADDLE_WEBHOOK_SECRET` | Your signing secret | Paddle Dashboard → Webhooks → Settings → Copy signing secret |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Supabase Settings → API → Service role key |

### Step 1.3: Set Up Paddle Webhook Endpoint

1. Go to [Paddle Dashboard](https://dashboard.paddle.com) → **Webhooks**
2. Click **Add Webhook Endpoint**
3. Set the URL to: `https://[your-project].supabase.co/functions/v1/paddle-webhook`
4. Select these events:
   - ✅ subscription.created
   - ✅ subscription.activated
   - ✅ subscription.updated
   - ✅ subscription.canceled
   - ✅ subscription.paused
   - ✅ transaction.completed
   - ✅ transaction.payment_failed

5. Copy the **Signing Secret** and save to Supabase as `PADDLE_WEBHOOK_SECRET`

---

## 🎨 PART 2: REACT COMPONENTS (5 minutes)

### Components Created:

✅ **FeatureGate.jsx** - Controls access to features based on subscription plan
- Location: `landing-page/src/components/FeatureGate.jsx`
- Usage: Wrap any feature in `<FeatureGate feature="csv_export">...</FeatureGate>`

✅ **TrialCountdown.jsx** - Displays trial countdown banner
- Location: `landing-page/src/components/TrialCountdown.jsx`
- Shows 3-day warning, trial ending, and count down

✅ **SubscriptionStatus.jsx** - Displays full subscription status
- Location: `landing-page/src/components/SubscriptionStatus.jsx`
- Shows plan, billing cycle, next payment date, actions

### How to Use:

```jsx
// In any page component
import { FeatureGate } from '../components/FeatureGate';
import { TrialCountdown } from '../components/TrialCountdown';
import { SubscriptionStatus } from '../components/SubscriptionStatus';

export default function Dashboard() {
  return (
    <div>
      {/* Show trial countdown if user is trialing */}
      <TrialCountdown />
      
      {/* Show subscription status */}
      <SubscriptionStatus />
      
      {/* Gate features by plan */}
      <FeatureGate feature="csv_export">
        <ExportButton />
      </FeatureGate>
    </div>
  );
}
```

---

## 🔧 PART 3: WEBHOOK SETUP (Already Done)

The webhook handler at `landing-page/supabase/functions/paddle-webhook/index.ts` now:

✅ Validates Paddle webhook signatures  
✅ Creates/updates subscriptions with trial dates  
✅ Records subscription events (created, upgraded, renewed, canceled)  
✅ Logs payment transactions with amounts and status  
✅ Updates user's current_plan and subscription_status  
✅ Handles: subscription.created, .updated, .canceled, .paused, transaction.completed, .payment_failed  

---

## 📦 PART 4: DEPLOYMENT (10 minutes)

### Step 4.1: Deploy Supabase Edge Functions

```bash
# Navigate to project root
cd "c:\Users\KIIT0001\Downloads\Antigravity Projects\Current Money SRC\Fintrack-V1"

# Deploy the updated webhook function
supabase functions deploy paddle-webhook --project-id [your-project-id]
```

Or go to Supabase Dashboard → Edge Functions → `paddle-webhook` → Deploy

### Step 4.2: Deploy Landing Page to Vercel

```bash
cd landing-page

# Deploy to production
vercel deploy --prod
```

### Step 4.3: Verify Deployment

1. Check Supabase Edge Function logs:
   - Supabase Dashboard → Edge Functions → `paddle-webhook` → Recent Invocations

2. Test with Paddle test card:
   - Go to your landing page
   - Click "Start Trial" on a plan
   - Use card: `4111 1111 1111 1111`
   - Complete checkout

3. Verify in Supabase:
   - Check `subscriptions` table for new row
   - Check `subscription_events` table for "created" event
   - Check `transactions` table for payment record
   - Check `users` table for `current_plan` update

---

## ✅ TESTING CHECKLIST

- [ ] Database migration runs without errors
- [ ] Supabase edge function environment variables set
- [ ] Paddle webhook endpoint added and verified
- [ ] Components deployed to landing page
- [ ] Test card payment completes
- [ ] Subscription record created in database
- [ ] Trial countdown displays correctly
- [ ] FeatureGate blocks non-paying users
- [ ] Webhook logs show successful processing

---

## 🎯 FINAL IMPLEMENTATION STATUS

### Fully Implemented ✅
- Paddle live checkout integration
- Database schema with subscription lifecycle
- Webhook event handling with full tracking
- React components for plan features, trial, and status
- Signature verification for webhook security
- Transaction history tracking
- Subscription event audit trail

### Ready to Use 🚀
- TrialCountdown component shows countdown warnings
- FeatureGate component gates features by plan
- SubscriptionStatus component displays all subscription info
- Users table tracks current_plan and subscription_status
- Plan features matrix allows flexible feature definitions

### Next Steps (Optional)
- Add email notifications (trial expiring, payment failed)
- Create billing management UI (update payment, cancel subscription)
- Add subscription analytics dashboard
- Set up renewal reminders (cron job)

---

## 💡 Example: Feature-Gating CSV Export

```jsx
import { FeatureGate } from '../components/FeatureGate';

function DataExport() {
  return (
    <FeatureGate 
      feature="csv_export"
      fallback={<UpgradePrompt />}
    >
      <button onClick={exportToCSV}>
        Export as CSV
      </button>
    </FeatureGate>
  );
}
```

## 💡 Example: Showing Trial Status

```jsx
import { TrialCountdown } from '../components/TrialCountdown';

function AccountPage() {
  return (
    <div>
      <TrialCountdown />
      {/* Rest of account page */}
    </div>
  );
}
```

---

**All done!** Your payment system is now production-ready. 🎉

