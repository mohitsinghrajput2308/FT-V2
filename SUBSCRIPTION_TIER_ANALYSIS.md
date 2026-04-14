# FinTrack Subscription Tier Implementation Analysis

## Overview
This document details the actual implementation of subscription tier limitations across different plan levels (Free, Pro, Business) in FinTrack for investment tracking and financial calculator features.

---

## 1. INVESTMENT TRACKING

### File Location
**Primary:** [landing-page/src/dashboard/pages/Investments.jsx](landing-page/src/dashboard/pages/Investments.jsx)

### Tier Limits

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Max Investments** | 3 | Unlimited | Unlimited |
| **Investment Types** | All (Stocks, Funds, Crypto, etc.) | All | All |
| **Live Price Updates** | Yes | Yes | Yes |
| **Asset Picker** | Yes (Stocks, Funds, Crypto, etc.) | Yes | Yes |
| **Portfolio Tracking** | Yes | Yes | Yes |

### Implementation Details

#### Limit Enforcement Logic (Line 227-230)
```jsx
const openModal = (item = null) => {
    setSelectedAsset(null);
    if (item) {
        // Editing — allowed for all tiers
        // ...
    } else {
        // Adding new investment — check plan limit
        if (!isPro && !isBusiness && investments.length >= 3) {
            setLimitModal(true);
            return;
        }
        // ...
    }
    // ...
};
```

**Key Points:**
- Free users can create up to 3 investments
- Pro and Business users have unlimited investments
- The limit check happens in the modal open handler
- When limit is reached, a `limitModal` is shown instead of the form

#### Limit Modal UI (Lines 600-630)
```jsx
{/* ── Investment Limit Modal (Free Users) ────────────────────────── */}
<Modal isOpen={limitModal} onClose={() => setLimitModal(false)} title="Investment Limit">
    <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You've reached the limit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Free plan: <span className="font-semibold">3 investments</span><br />
                Pro & Business: <span className="font-semibold">Unlimited</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Upgrade your plan to track more investments.
            </p>
        </div>
        // Navigation to pricing page...
    </div>
</Modal>
```

**User Experience:**
- Lock icon displayed with amber color
- Clear messaging showing limits for each tier
- Direct button to navigate to pricing page (`/dashboard/pricing`)
- Users can close or upgrade

---

## 2. FINANCIAL CALCULATORS

### File Location
**Primary:** [landing-page/src/dashboard/pages/Calculators.jsx](landing-page/src/dashboard/pages/Calculators.jsx)

### Tier Limits

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Access** | ❌ No Access | ✅ Full Access | ✅ Full Access |
| **EMI Calculator** | ❌ | ✅ | ✅ |
| **SIP Calculator** | ❌ | ✅ | ✅ |
| **Compound Interest** | ❌ | ✅ | ✅ |
| **Fixed Deposit** | ❌ | ✅ | ✅ |
| **Retirement Planning** | ❌ | ✅ | ✅ |
| **Savings Goal** | ❌ | ✅ | ✅ |
| **CI (Compound Interest)** | ❌ | ✅ | ✅ |

> **Total: 7 Calculators** - All are Pro/Business only features

### Implementation Details

#### Access Control at Component Level (Lines 156-190)
```jsx
const Calculators = () => {
    const { currency } = useFinance();
    const { isPro, isBusiness } = useSubscription();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('emi');

    // ── Access Control ──────────────────────────────────────────────────────
    if (!isPro && !isBusiness) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Calculators</h1>
                        <p className="text-gray-500 dark:text-gray-400">7 calculators to plan every aspect of your finances</p>
                    </div>
                </div>

                {/* Paywall Card */}
                <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            Financial Calculators are available to Pro and Business plan subscribers. Upgrade now to access all 7 calculators.
                        </p>
                        <Button
                            onClick={() => navigate('/dashboard/pricing')}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                        >
                            View Pricing Plans
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Rest of page shows all 7 calculators...
};
```

**Key Points:**
- Complete paywall at component level - Free users see nothing but the upgrade message
- The entire calculator interface is hidden with `return` early
- No calculator tabs or forms are rendered when user is on Free plan
- The access check is done at component render time, not per calculator

#### Available Calculators (TABS constant)
```jsx
const TABS = [
    { id: 'emi', label: 'EMI', icon: Calculator, color: 'primary' },
    { id: 'sip', label: 'SIP', icon: TrendingUp, color: 'success' },
    { id: 'compounds', label: 'Compound Interest', icon: Coins, color: 'warning' },
    { id: 'fd', label: 'Fixed Deposit', icon: PiggyBank, color: 'info' },
    { id: 'retirement', label: 'Retirement', icon: Wallet, color: 'danger' },
    { id: 'goal', label: 'Savings Goal', icon: Target, color: 'success' },
    { id: 'ci', label: 'CI', icon: Coins, color: 'primary' },
];
```

---

## 3. OTHER SUBSCRIPTION-BASED FEATURES

### Transaction Limits

**File:** [landing-page/src/dashboard/pages/Expenses.jsx](landing-page/src/dashboard/pages/Expenses.jsx) & [Income.jsx](landing-page/src/dashboard/pages/Income.jsx)

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Transactions per Month** | 50 | 500 | Unlimited |

**Limit Modal Code (Lines 430-450 in Expenses.jsx):**
```jsx
{/* ── Transaction Limit Modal (Free Users) ────────────────────────── */}
<Modal isOpen={limitModal} onClose={() => setLimitModal(false)} title="Transaction Limit">
    <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You've reached the transaction limit</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Free plan: <span className="font-semibold">50 transactions</span><br />
                Pro & Business: <span className="font-semibold">Unlimited</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Upgrade your plan to track unlimited transactions.
            </p>
        </div>
    </div>
</Modal>
```

### Budgets/Goals/Bills Limits

**Files:**
- [Budgets.jsx](landing-page/src/dashboard/pages/Budgets.jsx) - Line 68
- [Goals.jsx](landing-page/src/dashboard/pages/Goals.jsx) - Line 21
- [Bills.jsx](landing-page/src/dashboard/pages/Bills.jsx) - Line 37

**Plan Limit Constants:**
```jsx
// Budgets
const BUDGET_PLAN_LIMITS = { free: 2, pro: 5 }; // business = unlimited

// Goals
const GOAL_PLAN_LIMITS = { free: 2, pro: 5 }; // business = unlimited

// Bills
const BILL_PLAN_LIMITS = { free: 2, pro: 5 }; // business = unlimited
```

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Budgets** | 2 max | 5 max | Unlimited |
| **Savings Goals** | 2 max | 5 max | Unlimited |
| **Bill Reminders** | 2 max | 5 max | Unlimited |

**Enforcement Logic (Goals - Lines 100-112):**
```jsx
const openModal = (item = null) => {
    if (!item) {
        // Plan-based limit check for new goals
        if (!isBusiness) {
            const limit = GOAL_PLAN_LIMITS[isPro ? 'pro' : 'free'];
            if (goals.length >= limit) {
                setLimitModal(true);
                return;
            }
        }
    }
    // ... show form
};
```

### Custom Categories

**File:** [Categories.jsx](landing-page/src/dashboard/pages/Categories.jsx)

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Custom Categories** | ❌ Not allowed | 3 lifetime | Unlimited |
| **Default Categories** | ✅ All | ✅ All | ✅ All |

**Limit Constant (Line 28):**
```jsx
const PRO_CUSTOM_LIMIT = 3;
```

**Enforcement Logic (Lines 87-97):**
```jsx
const openModal = (type, item = null) => {
    // Editing an existing item — always allowed
    if (item) {
        // ...
        return;
    }

    // Adding new — check plan
    if (!isPro && !isBusiness) {
        setUpgradeModal(true);
        return;
    }
    if (isPro && !isBusiness && effectiveCategoryCount >= PRO_CUSTOM_LIMIT) {
        setLimitModal(true);
        return;
    }

    // ... show form
};
```

**Key Points:**
- Uses `customCategoriesCreated` lifetime counter in settings
- Pro users cannot delete and recreate categories to bypass the 3-category limit
- The counter is stored in DB and only increments, never decrements

### Data Export

**File:** [DashboardPricing.jsx](landing-page/src/dashboard/pages/DashboardPricing.jsx) - Line 89

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **CSV Export** | ❌ | ✅ | ✅ |
| **PDF Export** | ❌ | ✅ | ✅ |

---

## 4. SUBSCRIPTION TIER DETECTION

**File:** [landing-page/src/hooks/useSubscription.js](landing-page/src/hooks/useSubscription.js)

### Tier Detection Logic (Lines 75-115)

```jsx
export function useSubscription() {
    // ... setup code ...

    // Fall back to _cachedEmail so the bypass fires on first render before
    // getSession() resolves — eliminates the "free" flash for tester accounts.
    const TESTER_PRO_EMAIL = 'storagearea7070707070@gmail.com';
    const TESTER_BUSINESS_EMAIL = 'storagearea1010101010@gmail.com';
    const testerEmail = user?.email ?? _cachedEmail;
    const isTesterPro = testerEmail === TESTER_PRO_EMAIL;
    const isTesterBusiness = testerEmail === TESTER_BUSINESS_EMAIL;

    /** Is the user on a paid active plan? */
    const isPro = isTesterPro || (subscription?.plan === 'pro' && ['active', 'trialing'].includes(subscription?.status));
    const isBusiness = isTesterBusiness || (subscription?.plan === 'business' && ['active', 'trialing'].includes(subscription?.status));
    const isPaid = isPro || isBusiness;

    return {
        subscription,
        loading,
        user,
        isPaid,
        isPro,
        isBusiness,
        isTrialing,
        plan: isTesterBusiness ? 'business' : isTesterPro ? 'pro' : (subscription?.plan ?? 'free'),
        status: (isTesterPro || isTesterBusiness) ? 'active' : (subscription?.status ?? 'active'),
        subscribe,
        manageSubscription,
    };
}
```

**Key Points:**
- Tester emails can bypass payment to test Pro/Business features
- Subscription status must be `'active'` or `'trialing'`
- Defaults to `'free'` if no subscription found
- Uses Paddle for payment processing

---

## 5. PLAN VALIDATION & ENFORCEMENT

### Server-Side Validation

**File:** [landing-page/src/dashboard/utils/secureApi.js](landing-page/src/dashboard/utils/secureApi.js)

#### Plan Limits Constant (Line 22)
```jsx
const PLAN_ITEM_LIMITS = { free: 2, pro: 5 }; // 'business' is not present → unlimited
```

**Note:** The absence of 'business' key in the object means Business tier gets unlimited items.

#### Budget Creation with Limit Enforcement (Lines 179-200)
```jsx
export const SecureBudgetAPI = {
    async create(data, userId, limitInfo = null) {
        const blocked = checkRate(userId, 'budgets.create');
        if (blocked) return { error: blocked.error.message };

        // Plan-based limit enforcement
        if (limitInfo) {
            const { plan = 'free', existingCount = 0 } = limitInfo;
            const limit = PLAN_ITEM_LIMITS[plan];
            if (limit !== undefined && existingCount >= limit) {
                return { error: `You have reached the maximum limit for your current plan. Delete an existing budget or upgrade your plan to create more.` };
            }
        }

        const validation = validateBudgetData(data);
        if (!validation.valid) return validationError('Invalid budget data', validation.errors);

        return BudgetService.create({ ...validation.data, userId });
    },
    // ...
};
```

**Data Flow for Budget Creation:**
1. Component checks if limit reached (client-side UI)
2. If limit not reached, calls `addBudget(data, { plan, existingCount })`
3. FinanceContext passes to SecureAPI.budgets.create
4. SecureAPI validates the limit again (server-side)
5. If valid, persists to Supabase

---

## 6. PRICING PAGE COMPARISON TABLE

**File:** [DashboardPricing.jsx](landing-page/src/dashboard/pages/DashboardPricing.jsx) - Lines 55-95

Complete feature matrix displayed to users:

```jsx
const comparison = [
  {
    category: 'Core Tracking',
    rows: [
      { feature: 'Transactions per Month', free: '50', pro: '500', business: 'Unlimited' },
      { feature: 'Income & Expense Tracking', free: true, pro: true, business: true },
      { feature: 'Transaction Categories', free: 'Basic', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Recurring Transactions', free: true, pro: true, business: true },
      { feature: 'Investment Tracking', free: true, pro: true, business: true },
      { feature: 'Financial Calculators', free: true, pro: true, business: true },
    ],
  },
  {
    category: 'Budgets, Goals & Bills',
    rows: [
      { feature: 'Budgets', free: '2 max', pro: '5 max', business: 'Unlimited' },
      { feature: 'Savings Goals', free: '2 max', pro: '5 max', business: 'Unlimited' },
      { feature: 'Bill Reminders', free: '2 max', pro: '5 max', business: 'Unlimited' },
    ],
  },
  {
    category: 'Categories',
    rows: [
      { feature: 'Default Categories', free: true, pro: true, business: true },
      { feature: 'Custom Categories', free: false, pro: '3 lifetime', business: 'Unlimited' },
    ],
  },
  {
    category: 'Reports & Exports',
    rows: [
      { feature: 'Analytics Dashboard', free: true, pro: true, business: true },
      { feature: 'CSV Export', free: false, pro: true, business: true },
      { feature: 'PDF Export', free: false, pro: true, business: true },
    ],
  },
];
```

**Note on Investment Tracking:** The pricing page shows "Investment Tracking" is available in all tiers, but the actual limit is enforced in the component (3 for free, unlimited for pro/business).

**Note on Financial Calculators:** The pricing page shows "Financial Calculators" as available in all tiers, but the component enforces Pro/Business only access.

---

## 7. SUMMARY TABLE: ALL LIMITATIONS

| Feature | Free | Pro | Business | File |
|---------|------|-----|----------|------|
| **Transactions/Month** | 50 | 500 | Unlimited | Expenses.jsx, Income.jsx |
| **Investments** | 3 | Unlimited | Unlimited | Investments.jsx |
| **Budgets** | 2 | 5 | Unlimited | Budgets.jsx |
| **Savings Goals** | 2 | 5 | Unlimited | Goals.jsx |
| **Bill Reminders** | 2 | 5 | Unlimited | Bills.jsx |
| **Custom Categories** | 0 | 3 (lifetime) | Unlimited | Categories.jsx |
| **Financial Calculators** | 0/7 | 7/7 | 7/7 | Calculators.jsx |
| **CSV Export** | ❌ | ✅ | ✅ | DashboardPricing.jsx |
| **PDF Export** | ❌ | ✅ | ✅ | DashboardPricing.jsx |

---

## 8. PRICING TIERS

**File:** [DashboardPricing.jsx](landing-page/src/dashboard/pages/DashboardPricing.jsx) - Lines 9-52

```jsx
const plans = [
  {
    key: 'free',
    label: 'FREE',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for tracking basic spending',
    features: [
      'Up to 50 transactions per month',
      '2 budgets, 2 goals & 2 bills',
      'Basic expense categories',
      'Simple transaction tracking',
      'Email support',
    ],
  },
  {
    key: 'pro',
    label: 'PRO',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    description: 'Best for serious personal finance tracking',
    features: [
      'Everything in Free',
      'Up to 500 transactions per month',
      '5 budgets, 5 goals & 5 bills',
      'Unlimited custom categories',
      'CSV & PDF data export',
      'Priority email support',
    ],
  },
  {
    key: 'business',
    label: 'BUSINESS',
    name: 'Business',
    price: { monthly: 29.99, yearly: 24.99 },
    description: 'For small teams managing finances together',
    features: [
      'Everything in Pro',
      'Unlimited transactions',
      'Unlimited budgets, goals & bills',
      'Unlimited custom categories',
      'Multi-user access (up to 3 users)',
      'Dedicated support',
    ],
  },
];
```

---

## Key Findings

### Investment Tracking
✅ **Accessible at all tiers** - Free/Pro/Business can all track investments
⚠️ **Quantity Limited** - Free users can track only 3, Pro/Business unlimited

### Financial Calculators
❌ **Paywall enforced** - Completely hidden from Free users at component level
✅ **7 Calculators available** - EMI, SIP, Compound Interest, Fixed Deposit, Retirement, Savings Goal, CI
✅ **Pro/Business access** - Both tiers have identical access

### Other Notable Patterns
- Limits are checked at **two levels**: UI (component render) and API (secureApi.js)
- Modal paywalls show clear messaging with tier limits
- **Pro users can never exceed 3 custom categories** - enforced via lifetime counter
- **Transaction limits not enforced in code** - appears to be UI-only currently
- **Paddle payment processor** - used for subscription management and status tracking

---

## Testing Tester Accounts

From [useSubscription.js](landing-page/src/hooks/useSubscription.js):

```javascript
const TESTER_PRO_EMAIL = 'storagearea7070707070@gmail.com';
const TESTER_BUSINESS_EMAIL = 'storagearea1010101010@gmail.com';
```

These accounts bypass payment and automatically unlock Pro/Business features for testing.

