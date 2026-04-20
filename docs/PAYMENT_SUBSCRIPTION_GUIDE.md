# Complete Payment & Subscription Lifecycle Guide
**FinTrack SaaS — Paddle + Supabase Integration**

---

## Table of Contents
1. [Testing Without Real Money](#testing-without-real-money)
2. [Payment Processing Flow (Step-by-Step)](#payment-processing-flow)
3. [Subscription Lifecycle & Expiry](#subscription-lifecycle--expiry)
4. [Supabase Schema Design](#supabase-schema-design)
5. [Webhook Integration](#webhook-integration)
6. [Implementation Examples](#implementation-examples)

---

## Testing Without Real Money

### Paddle Test Cards

Paddle provides **test cards** that simulate various payment scenarios:

```
✅ Successful Payment:
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits

❌ Card Declined:
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits

⚠️ 3D Secure Required:
Card Number: 4000 0000 0000 3220
Expiry: Any future date
CVC: Any 3 digits

⏳ Processing Delay:
Card Number: 5555 5555 5555 4444
Expiry: Any future date
CVC: Any 3 digits
```

### How to Test

**Step 1: Activate Sandbox Mode (for testing)**
```bash
# In .env (local development only)
REACT_APP_PADDLE_CLIENT_TOKEN=test_43419997b9925e6e56938a426be
REACT_APP_PADDLE_SANDBOX=true  # Enable only for testing
```

**Step 2: Test in Pricing Page**
- Navigate to `/pricing`
- Click "Start 7-Day Free Trial"
- Enter test card details
- Complete checkout without real charge

**Step 3: Verify in Paddle Dashboard**
- Go to Paddle Dashboard → **Sandbox** tab (separate from production)
- Check "Transactions" to see test payments
- Verify webhook deliveries in "Webhooks" → "Event History"

### What Gets Tested

✅ Full checkout flow  
✅ Payment success/failure scenarios  
✅ Trial period initiation  
✅ Webhook delivery (simulated)  
✅ Subscription creation in Supabase  

---

## Payment Processing Flow

### Complete Journey: Click → Payment → Access

```
USER CLICKS "START TRIAL"
    ↓
┌─────────────────────────────────────────────┐
│ FRONTEND (React)                            │
│ PricingPage.jsx opens Paddle Checkout       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ PADDLE CHECKOUT (iframe)                    │
│ - User enters card details                  │
│ - User confirms payment                     │
│ - Paddle processes securely (PCI compliant) │
└─────────────────────────────────────────────┘
    ↓
PAYMENT SUCCESS ✅
    ↓
┌─────────────────────────────────────────────┐
│ PADDLE BACKEND                              │
│ - Creates subscription                      │
│ - Sends webhook to your backend             │
│ - Triggers customer.created + subscription  │
│   .created events                           │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ YOUR BACKEND (Supabase Edge Function)      │
│ /supabase/functions/paddle-webhook          │
│ - Receives webhook event                    │
│ - Validates signature                       │
│ - Creates subscription record in Supabase   │
│ - Sets trial_ends_at + status = 'active'    │
│ - Triggers welcome email                    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ FRONTEND (User sees)                        │
│ - checkout.completed event fires            │
│ - User redirected to dashboard              │
│ - "Pro plan activated" confirmation         │
│ - Trial countdown displays                  │
└─────────────────────────────────────────────┘
    ↓
USER NOW HAS ACCESS TO PRO FEATURES ✅
```

### Detailed Step-by-Step Breakdown

#### Step 1: User Clicks "Start Trial"
```javascript
// PricingPage.jsx
const handlePlanClick = (planId) => {
  if (!user) {
    openRegister(); // User must be logged in
    return;
  }

  const plan = plans.find((p) => p.id === planId);
  const priceId = plan.monthlyTrialPriceId; // 7-day trial

  // Open Paddle checkout
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: { 
      user_id: user.id,      // Pass user ID to webhook
      email: user.email 
    },
    customer: { 
      email: user.email 
    },
  });
};
```

#### Step 2: User Completes Payment
- Paddle iframe handles all PCI compliance
- User enters card details securely
- Paddle processes payment server-to-server
- **No card data touches your backend** ✅

#### Step 3: Paddle Sends Webhook
```json
{
  "event_id": "evt_01234567890",
  "event_type": "subscription.created",
  "data": {
    "id": "sub_01234567890",
    "customer_id": "ctm_01234567890",
    "items": [
      {
        "price": {
          "id": "pri_01kpjef8c48hr2hb60fmtgn1yx",
          "billing_cycle": {
            "interval": "month",
            "frequency": 1
          }
        },
        "quantity": 1
      }
    ],
    "status": "trialing",
    "current_billing_period": {
      "starts_at": "2026-04-20T10:00:00Z",
      "ends_at": "2026-04-27T10:00:00Z"
    },
    "custom_data": {
      "user_id": "12345678-1234-1234-1234-123456789abc",
      "email": "user@example.com"
    }
  }
}
```

#### Step 4: Backend Processes Webhook
```typescript
// supabase/functions/paddle-webhook/index.ts
const handler = async (req: Request) => {
  const body = await req.json();
  const eventType = body.event_type;

  if (eventType === 'subscription.created') {
    const subscription = body.data;
    const userId = subscription.custom_data.user_id;

    // 1. Create subscription in Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        paddle_subscription_id: subscription.id,
        status: subscription.status, // 'trialing' or 'active'
        plan: getPlanFromPriceId(subscription.items[0].price.id),
        trial_ends_at: subscription.current_billing_period.ends_at,
        current_period_ends_at: subscription.current_billing_period.ends_at,
        created_at: new Date(),
      });

    // 2. Update user subscription status
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'active',
        current_plan: getPlanFromPriceId(subscription.items[0].price.id),
      })
      .eq('id', userId);

    // 3. Send welcome email
    await sendWelcomeEmail(subscription.custom_data.email);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
};
```

#### Step 5: Frontend Listens for Success
```javascript
// PricingPage.jsx - useEffect to listen for checkout completion
useEffect(() => {
  const handleCheckoutCompleted = (event) => {
    if (event.name === 'checkout.completed') {
      console.log('Payment successful!', event.data);
      // 1. Show success message
      showSuccessToast('Welcome! Your trial has started');
      
      // 2. Refresh user subscription data
      await refetchUserSubscription();
      
      // 3. Redirect to dashboard
      navigate('/dashboard');
    }
  };

  window.addEventListener('paddle:checkout:completed', handleCheckoutCompleted);
  
  return () => {
    window.removeEventListener('paddle:checkout:completed', handleCheckoutCompleted);
  };
}, []);
```

---

## Subscription Lifecycle & Expiry

### Timeline: Trial → Active → Renewal/Expiry

```
DAY 1: User starts 7-day trial
├─ Status: trialing
├─ trial_ends_at: Day 8, 10:00 AM
└─ current_period_ends_at: Day 8, 10:00 AM

DAY 7: System sends "Your trial ends tomorrow"
├─ Email notification
├─ In-app banner
└─ 24-hour warning

DAY 8, 9:59 AM: Trial ending soon
├─ Last chance notification
└─ Final reminder in dashboard

DAY 8, 10:00 AM: Trial expires
├─ Paddle triggers subscription.updated event
├─ Status changes: trialing → active (payment charged!)
├─ OR status stays active if payment succeeds
├─ current_period_ends_at: Day 35 (30 days from now)
└─ next_billing_date: Day 35

DAY 8, 10:05 AM: Webhook reaches backend
├─ Update subscription.status in Supabase
├─ Set paid_at timestamp
├─ Send invoice email
└─ User gets full access (already had it, trial just converted)

DAY 35: Another billing cycle
├─ Paddle attempts charge
├─ Payment succeeds OR fails
└─ Webhook notifies backend
```

### What Happens at Expiry

#### Scenario A: Payment Succeeds (Trial Converts to Paid)
```typescript
// Webhook: subscription.updated (trial → paid)
{
  "event_type": "subscription.updated",
  "data": {
    "id": "sub_01234567890",
    "status": "active",  // No longer trialing
    "current_billing_period": {
      "starts_at": "2026-04-27T10:00:00Z",
      "ends_at": "2026-05-27T10:00:00Z"
    },
    "paid_at": "2026-04-27T10:00:00Z"
  }
}

// Backend updates:
UPDATE subscriptions SET
  status = 'active',
  trial_ends_at = NULL,
  current_period_ends_at = '2026-05-27T10:00:00Z',
  paid_at = '2026-04-27T10:00:00Z'
WHERE paddle_subscription_id = 'sub_01234567890';

// User keeps access ✅
// Dashboard shows: "Your subscription renews on May 27"
```

#### Scenario B: Payment Fails (Billing Issue)
```typescript
// Webhook: transaction.completed (FAILED)
{
  "event_type": "transaction.completed",
  "data": {
    "id": "txn_01234567890",
    "subscription_id": "sub_01234567890",
    "status": "failed",
    "error_code": "card_declined"
  }
}

// Backend marks subscription as past_due:
UPDATE subscriptions SET
  status = 'past_due',
  payment_failed_at = NOW()
WHERE paddle_subscription_id = 'sub_01234567890';

UPDATE users SET
  features_access = 'limited'  -- Downgrade access
WHERE id = userId;

// Send urgent email:
"Payment Failed - Update Your Card to Keep Access"
```

#### Scenario C: User Cancels During Trial
```typescript
// User clicks "Cancel Subscription"
// Paddle sends: subscription.canceled

UPDATE subscriptions SET
  status = 'canceled',
  canceled_at = NOW(),
  trial_ends_at = NOW()  -- Ends immediately
WHERE paddle_subscription_id = 'sub_01234567890';

UPDATE users SET
  current_plan = 'free',
  subscription_status = 'canceled'
WHERE id = userId;

// User loses pro features immediately
// Can still use free tier
```

### Notifications Before/After Expiry

```typescript
// Supabase Edge Function: subscription-reminders (runs daily)

async function sendExpiryNotifications() {
  // Find subscriptions expiring in 24 hours
  const expiringTomorrow = await supabase
    .from('subscriptions')
    .select('*, users(*)')
    .eq('status', 'trialing')
    .filter('trial_ends_at', 'lte', tomorrow())
    .filter('trial_ends_at', 'gt', today());

  for (const sub of expiringTomorrow.data) {
    await sendEmail(sub.users.email, {
      subject: "Your FinTrack trial ends tomorrow",
      template: 'trial_expiring_24h',
      variables: {
        userName: sub.users.name,
        expiresAt: sub.trial_ends_at,
        planName: sub.plan,
        price: getPriceForPlan(sub.plan),
      }
    });
  }

  // Find subscriptions that expired but have payment pending
  const pastDue = await supabase
    .from('subscriptions')
    .select('*, users(*)')
    .eq('status', 'past_due')
    .filter('payment_failed_at', 'gt', 24_hours_ago());

  for (const sub of pastDue.data) {
    await sendEmail(sub.users.email, {
      subject: "Urgent: Fix Your Payment to Restore Access",
      template: 'payment_failed_urgent',
      variables: {
        userName: sub.users.name,
        retryUrl: generateUpdatePaymentLink(sub.user_id),
      }
    });
  }
}
```

---

## Supabase Schema Design

### Recommended Table Structure

```sql
-- Users table (extended)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  
  -- Subscription info (denormalized for quick access)
  current_plan TEXT DEFAULT 'free', -- 'free' | 'pro' | 'business'
  subscription_status TEXT DEFAULT 'inactive', -- 'active' | 'trialing' | 'past_due' | 'canceled'
  
  -- Feature access control
  features_access JSONB DEFAULT '{"free": true}', -- Stores enabled features based on plan
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (main)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Paddle identifiers
  paddle_subscription_id TEXT NOT NULL UNIQUE,
  paddle_customer_id TEXT NOT NULL,
  
  -- Plan details
  plan TEXT NOT NULL, -- 'pro' | 'business'
  billing_cycle TEXT NOT NULL, -- 'monthly' | 'yearly'
  
  -- Status tracking
  status TEXT NOT NULL, -- 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'
  
  -- Trial info
  trial_ends_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ,
  
  -- Billing period
  current_period_starts_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  
  -- Payment tracking
  paid_at TIMESTAMPTZ,
  payment_failed_at TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  
  -- Cancellation
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Management
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription history (audit trail)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  
  event_type TEXT NOT NULL, -- 'created' | 'upgraded' | 'downgraded' | 'renewed' | 'canceled' | 'payment_failed'
  from_plan TEXT,
  to_plan TEXT,
  
  metadata JSONB, -- Store extra details (old price, new price, etc.)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (payments)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  paddle_transaction_id TEXT NOT NULL UNIQUE,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  status TEXT NOT NULL, -- 'completed' | 'failed' | 'refunded' | 'pending'
  payment_method TEXT, -- 'card' | 'paypal' | 'apple_pay'
  
  invoice_url TEXT,
  receipt_url TEXT,
  
  error_code TEXT, -- 'card_declined', 'insufficient_funds', etc.
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags by plan
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL UNIQUE, -- 'free' | 'pro' | 'business'
  
  features JSONB NOT NULL, -- { "unlimited_transactions": true, "api_access": false, ... }
  
  max_transactions_per_month INT,
  max_budgets INT,
  max_goals INT,
  custom_categories BOOLEAN,
  csv_export BOOLEAN,
  priority_support BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_id ON subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period ON subscriptions(current_period_ends_at);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_subscription_id ON transactions(subscription_id);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON subscription_events(event_type);

CREATE INDEX idx_users_subscription_status ON users(subscription_status);
```

### Row Level Security (RLS) for Feature Access

```sql
-- Users can only see their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Supabase admin can manage subscriptions (webhooks)
CREATE POLICY "Admin can manage subscriptions"
  ON subscriptions
  USING (auth.jwt() ->> 'role' = 'admin');

-- Similar for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### Plan Features Table

```sql
INSERT INTO plan_features (plan, features, max_transactions_per_month, max_budgets, custom_categories, csv_export, priority_support)
VALUES
  ('free', '{"unlimited_transactions": false, "custom_categories": false, "csv_export": false, "priority_support": false}'::jsonb, 50, 2, false, false, false),
  ('pro', '{"unlimited_transactions": false, "custom_categories": true, "csv_export": true, "priority_support": true}'::jsonb, 500, 10, true, true, true),
  ('business', '{"unlimited_transactions": true, "custom_categories": true, "csv_export": true, "priority_support": true}'::jsonb, NULL, NULL, true, true, true);
```

---

## Webhook Integration

### Setting Up Paddle Webhooks

1. Go to **Paddle Dashboard → Developers → Webhooks**
2. Click **"Add Endpoint"**
3. Enter your URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/paddle-webhook
   ```
4. Select events to receive:
   ```
   ✅ subscription.created
   ✅ subscription.updated
   ✅ subscription.canceled
   ✅ transaction.completed
   ✅ transaction.failed
   ✅ customer.created
   ```
5. Copy the **Webhook Signing Secret** for validation

### Webhook Handler (Supabase Edge Function)

```typescript
// supabase/functions/paddle-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PADDLE_SECRET = Deno.env.get("PADDLE_WEBHOOK_SECRET")!;

// Validate Paddle webhook signature
function validateWebhookSignature(
  body: string,
  signature: string
): boolean {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const key = encoder.encode(PADDLE_SECRET);
  
  const hash = hmac("sha256", key, data);
  const computed = btoa(hash);
  
  return computed === signature;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Get signature from header
  const signature = req.headers.get("Paddle-Signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // Get raw body for signature validation
  const body = await req.text();
  
  // Validate signature
  if (!validateWebhookSignature(body, signature)) {
    console.error("Invalid webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event_type;
  const data = event.data;

  try {
    switch (eventType) {
      // ═══════════════════════════════════════════════════════════════
      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;

      // ═══════════════════════════════════════════════════════════════
      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;

      // ═══════════════════════════════════════════════════════════════
      case "subscription.canceled":
        await handleSubscriptionCanceled(data);
        break;

      // ═══════════════════════════════════════════════════════════════
      case "transaction.completed":
        if (data.status === "completed") {
          await handleTransactionCompleted(data);
        } else if (data.status === "failed") {
          await handleTransactionFailed(data);
        }
        break;

      // ═══════════════════════════════════════════════════════════════
      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.custom_data?.user_id;
  if (!userId) {
    console.error("Missing user_id in custom_data");
    return;
  }

  const planFromPrice = getPlanFromPriceId(subscription.items[0]?.price?.id);

  // Create subscription record
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      paddle_subscription_id: subscription.id,
      paddle_customer_id: subscription.customer_id,
      plan: planFromPrice,
      billing_cycle: getBillingCycleFromPrice(subscription.items[0]?.price?.id),
      status: subscription.status, // 'trialing' or 'active'
      trial_starts_at: subscription.status === "trialing" ? new Date().toISOString() : null,
      trial_ends_at: subscription.current_billing_period?.ends_at,
      current_period_starts_at: subscription.current_billing_period?.starts_at,
      current_period_ends_at: subscription.current_billing_period?.ends_at,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }

  // Update user
  await supabase
    .from("users")
    .update({
      current_plan: planFromPrice,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Record event
  await recordSubscriptionEvent(userId, data[0].id, "created", null, planFromPrice);

  // Send welcome email
  await sendEmail(subscription.custom_data.email, {
    subject: "Welcome to FinTrack!",
    template: "welcome",
    variables: {
      name: subscription.custom_data.name,
      plan: planFromPrice,
      trialsEndsAt: subscription.current_billing_period?.ends_at,
    },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("paddle_subscription_id", subscription.id)
    .single();

  if (error) {
    console.error("Subscription not found:", error);
    return;
  }

  const oldPlan = data.plan;
  const newPlan = getPlanFromPriceId(subscription.items[0]?.price?.id);
  const upgraded = isUpgrade(oldPlan, newPlan);

  // Update subscription
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      plan: newPlan,
      status: subscription.status,
      current_period_starts_at: subscription.current_billing_period?.starts_at,
      current_period_ends_at: subscription.current_billing_period?.ends_at,
      paid_at: subscription.status !== "trialing" ? new Date().toISOString() : data.paid_at,
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", subscription.id);

  if (updateError) {
    console.error("Error updating subscription:", error);
    throw updateError;
  }

  // Update user
  await supabase
    .from("users")
    .update({
      current_plan: newPlan,
      subscription_status: subscription.status === "trialing" ? "trialing" : "active",
    })
    .eq("id", data.user_id);

  // Record event
  const eventType = upgraded ? "upgraded" : "downgraded";
  await recordSubscriptionEvent(data.user_id, data.id, eventType, oldPlan, newPlan);

  // Send notification
  const user = await getUser(data.user_id);
  await sendEmail(user.email, {
    subject: upgraded ? "Welcome to your new plan!" : "Plan downgraded",
    template: upgraded ? "upgrade_success" : "downgrade_notice",
    variables: {
      oldPlan,
      newPlan,
      name: user.name,
    },
  });
}

async function handleSubscriptionCanceled(subscription: any) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("paddle_subscription_id", subscription.id)
    .single();

  if (error) {
    console.error("Subscription not found:", error);
    return;
  }

  // Mark as canceled
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", subscription.id);

  // Downgrade user to free
  await supabase
    .from("users")
    .update({
      current_plan: "free",
      subscription_status: "canceled",
    })
    .eq("id", data.user_id);

  // Record event
  await recordSubscriptionEvent(data.user_id, data.id, "canceled", data.plan, "free");

  // Send cancellation email
  const user = await getUser(data.user_id);
  await sendEmail(user.email, {
    subject: "We'll miss you!",
    template: "cancellation_notice",
    variables: {
      name: user.name,
      reactivateUrl: generateReactivateLink(data.user_id),
    },
  });
}

async function handleTransactionCompleted(transaction: any) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      paddle_transaction_id: transaction.id,
      paddle_subscription_id: transaction.subscription_id,
      amount: transaction.amount / 100, // Convert cents to dollars
      currency: transaction.currency,
      status: "completed",
      payment_method: transaction.payment_method,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }

  // Get subscription to find user
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("paddle_subscription_id", transaction.subscription_id)
    .single();

  if (sub) {
    // Update subscription last_payment_date
    await supabase
      .from("subscriptions")
      .update({
        last_payment_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        status: "active",
      })
      .eq("paddle_subscription_id", transaction.subscription_id);

    // Send invoice email
    const user = await getUser(sub.user_id);
    await sendEmail(user.email, {
      subject: `Invoice ${transaction.id}`,
      template: "invoice",
      variables: {
        amount: transaction.amount,
        currency: transaction.currency,
        date: new Date().toLocaleDateString(),
        invoiceUrl: transaction.invoice_url,
      },
    });
  }
}

async function handleTransactionFailed(transaction: any) {
  // Record failed transaction
  await supabase.from("transactions").insert({
    paddle_transaction_id: transaction.id,
    paddle_subscription_id: transaction.subscription_id,
    amount: transaction.amount / 100,
    currency: transaction.currency,
    status: "failed",
    error_code: transaction.error_code,
    error_message: transaction.error_message,
    created_at: new Date().toISOString(),
  });

  // Get subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("paddle_subscription_id", transaction.subscription_id)
    .single();

  if (sub) {
    // Mark subscription as past_due
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        payment_failed_at: new Date().toISOString(),
      })
      .eq("paddle_subscription_id", transaction.subscription_id);

    // Downgrade user features
    await supabase
      .from("users")
      .update({
        subscription_status: "past_due",
      })
      .eq("id", sub.user_id);

    // Send urgent email
    const user = await getUser(sub.user_id);
    await sendEmail(user.email, {
      subject: "Payment Failed - Action Required",
      template: "payment_failed",
      variables: {
        name: user.name,
        errorMessage: transaction.error_message,
        updatePaymentUrl: generateUpdatePaymentLink(sub.user_id),
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getPlanFromPriceId(priceId: string): string {
  const proPrices = [
    "pri_01kpjeaqgj2jee2kdyhvpwb1dt", // monthly
    "pri_01kpjef8c48hr2hb60fmtgn1yx", // monthly trial
    "pri_01kpjen114xwk6rv87t0mrse8j", // yearly
    "pri_01kpjerzv1sxndswe1xy8x3t3c", // yearly trial
  ];

  const businessPrices = [
    "pri_01kpjf646mpzsfy5g9j9079rwe", // monthly
    "pri_01kpjfakbv47fhyqa899704nhg", // monthly trial
    "pri_01kpjffwt20daa9ra66myxxed8", // yearly
    "pri_01kpjfmzrd0ae227q77qqja3jv", // yearly trial
  ];

  if (proPrices.includes(priceId)) return "pro";
  if (businessPrices.includes(priceId)) return "business";
  return "free";
}

function getBillingCycleFromPrice(priceId: string): string {
  const monthlyPrices = [
    "pri_01kpjeaqgj2jee2kdyhvpwb1dt",
    "pri_01kpjef8c48hr2hb60fmtgn1yx",
    "pri_01kpjf646mpzsfy5g9j9079rwe",
    "pri_01kpjfakbv47fhyqa899704nhg",
  ];

  return monthlyPrices.includes(priceId) ? "monthly" : "yearly";
}

function isUpgrade(oldPlan: string, newPlan: string): boolean {
  const hierarchy = { free: 0, pro: 1, business: 2 };
  return hierarchy[newPlan] > hierarchy[oldPlan];
}

async function recordSubscriptionEvent(
  userId: string,
  subscriptionId: string,
  eventType: string,
  fromPlan: string | null,
  toPlan: string
) {
  await supabase.from("subscription_events").insert({
    user_id: userId,
    subscription_id: subscriptionId,
    event_type: eventType,
    from_plan: fromPlan,
    to_plan: toPlan,
    created_at: new Date().toISOString(),
  });
}

async function getUser(userId: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

async function sendEmail(to: string, options: any) {
  // Implement your email service (SendGrid, Resend, etc.)
  console.log(`Sending email to ${to}:`, options);
  // await emailService.send({ to, ...options });
}

function generateUpdatePaymentLink(userId: string): string {
  return `${Deno.env.get("APP_URL")}/billing/update-payment?user_id=${userId}`;
}

function generateReactivateLink(userId: string): string {
  return `${Deno.env.get("APP_URL")}/pricing?reactivate=${userId}`;
}
```

---

## Implementation Examples

### Example 1: Check User's Plan in React Component

```jsx
// components/FeatureGate.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const FeatureGate = ({ feature, children, fallback }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('current_plan, subscription_status')
        .eq('id', user.id)
        .single();

      const { data: planFeatures } = await supabase
        .from('plan_features')
        .select('features')
        .eq('plan', userData.current_plan)
        .single();

      const access = planFeatures.features[feature] === true;
      setHasAccess(access);
      setLoading(false);
    }

    checkAccess();
  }, [feature]);

  if (loading) return <div>Loading...</div>;
  
  return hasAccess ? children : (fallback || <UpgradePrompt feature={feature} />);
};

// Usage:
<FeatureGate feature="csv_export">
  <ExportButton />
</FeatureGate>
```

### Example 2: Display Trial Countdown

```jsx
// components/TrialCountdown.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const TrialCountdown = () => {
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    async function getTrialInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('trial_ends_at, status')
        .eq('user_id', user.id)
        .eq('status', 'trialing')
        .single();

      if (subscription?.trial_ends_at) {
        const ends = new Date(subscription.trial_ends_at);
        const now = new Date();
        const days = Math.ceil((ends - now) / (1000 * 60 * 60 * 24));
        
        setTrialEndsAt(ends);
        setDaysRemaining(Math.max(0, days));
      }
    }

    getTrialInfo();
    const interval = setInterval(getTrialInfo, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  if (!trialEndsAt) return null;

  if (daysRemaining === 0) {
    return (
      <div className="bg-orange-100 p-4 rounded">
        <p className="font-bold">Your trial ends today!</p>
        <p>Your subscription will automatically renew unless canceled.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 p-4 rounded">
      <p className="font-bold">{daysRemaining} days left in your trial</p>
      <p className="text-sm text-gray-600">
        Your trial ends on {trialEndsAt.toLocaleDateString()}
      </p>
    </div>
  );
};
```

### Example 3: Handle Subscription Status in Dashboard

```jsx
// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrialCountdown } from '../components/TrialCountdown';
import { PaymentRequired } from '../components/PaymentRequired';

export const Dashboard = () => {
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setSubscription(sub);
    }

    loadData();
  }, []);

  // Show based on subscription status
  if (subscription?.status === 'past_due') {
    return (
      <PaymentRequired 
        message="Your payment failed. Please update your payment method."
        subscriptionId={subscription.id}
      />
    );
  }

  if (subscription?.status === 'canceled') {
    return (
      <div className="p-8 text-center">
        <h2>Your subscription has been canceled</h2>
        <p className="text-gray-600 mt-2">You're now on the Free plan</p>
        <button onClick={() => navigateTo('/pricing')}>
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div>
      {subscription?.status === 'trialing' && <TrialCountdown />}
      
      <div className="mt-8">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p className="text-gray-600">Current Plan: {subscription?.plan}</p>
      </div>

      {/* Rest of dashboard */}
    </div>
  );
};
```

---

## Summary: Payment Flow Checklist

✅ **User initiates payment** → Clicks "Start Trial"  
✅ **Paddle processes** → Secure checkout, no card on your server  
✅ **Webhook notifies backend** → Subscription created in Supabase  
✅ **Database updated** → User plan, trial dates, status set  
✅ **Frontend listens** → checkout.completed event triggers  
✅ **User sees confirmation** → Redirected to dashboard  
✅ **Email sent** → Welcome / trial info  
✅ **Trial ends** → Paddle attempts payment or trial expires  
✅ **Success/Failure** → Webhook notifies, user upgraded/downgraded  
✅ **Ongoing management** → Cron jobs send reminders, webhooks track changes  

---

## Next Steps

1. **Deploy webhook function** to Supabase
2. **Set up Paddle webhooks** (add endpoint + signing secret)
3. **Test with Paddle test cards** (in your .env sandbox mode)
4. **Verify database records** created after test payment
5. **Check email delivery** for confirmations
6. **Monitor webhook logs** in Paddle Dashboard
7. **Go live** when confident

---

**Questions?** Check the webhook logs in Paddle Dashboard or Supabase Edge Function logs for debugging.
