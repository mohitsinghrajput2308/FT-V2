# Priority Support - Pro & Business Plan Setup

## ✅ What's Included

**Priority Support is available for:**
- ✅ **Pro Plan** ($9.99/month)
- ✅ **Business Plan** ($29.99/month)
- ❌ Free Plan users (locked behind upgrade prompt)

---

## 🎯 How to Grant Priority Support Access

### For Pro Plan Users

**Method 1: Set `is_pro` to true**
```sql
UPDATE profiles 
SET is_pro = TRUE 
WHERE id = 'USER_ID';
```

**Method 2: Set subscription_tier**
```sql
UPDATE profiles 
SET subscription_tier = 'pro' 
WHERE id = 'USER_ID';
```

### For Business Plan Users

**Set subscription_tier to 'business'**
```sql
UPDATE profiles 
SET subscription_tier = 'business' 
WHERE id = 'USER_ID';
```

---

## 🔍 Database Setup

### Required Columns in `profiles` Table

You need at least ONE of these:

```sql
-- Option A: Add is_pro column (boolean)
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;

-- Option B: Add subscription_tier column (text)
ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
-- Values: 'free', 'pro', 'business'

-- Option C: Recommended - Have both
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
```

### View Your User's Current Status

```sql
SELECT 
  id, 
  email, 
  is_pro, 
  subscription_tier,
  CASE 
    WHEN is_pro = TRUE THEN 'Has Priority Support (Pro)'
    WHEN subscription_tier = 'pro' THEN 'Has Priority Support (Pro)'
    WHEN subscription_tier = 'business' THEN 'Has Priority Support (Business)'
    ELSE 'No Priority Support (Free)'
  END as support_access
FROM profiles 
WHERE email = 'your-email@example.com';
```

---

## 🚀 Quick Setup Steps

### Step 1: Go to Supabase

[Supabase Dashboard](https://supabase.com/dashboard)

### Step 2: Run SQL Query

```sql
-- For Pro user
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'pro-user@example.com');

-- For Business user
UPDATE profiles 
SET subscription_tier = 'business'
WHERE id = (SELECT id FROM auth.users WHERE email = 'business-user@example.com');
```

### Step 3: Verify

```sql
SELECT id, email, subscription_tier FROM profiles 
WHERE subscription_tier IN ('pro', 'business');
```

Should show your users with their plan type.

### Step 4: Test

1. Log in as that user
2. Refresh the page (Ctrl+R)
3. Go to **Dashboard → Priority Support**
4. Should see ticket form, NOT upgrade message

---

## 🔧 Component Logic

The component checks access in this order:

```javascript
// 1. Check localIsPro from AuthContext
if (localIsPro) {
  grant_access = true;
}

// 2. Check profiles.is_pro column
if (profiles.is_pro === true) {
  grant_access = true;
}

// 3. Check subscription_tier column
if (profiles.subscription_tier === 'pro' || profiles.subscription_tier === 'business') {
  grant_access = true;
}

// Otherwise: show upgrade message
```

---

## 📊 Examples

### Example 1: Set up 3 users

```sql
-- Pro user
UPDATE profiles SET subscription_tier = 'pro' 
WHERE email = 'alice@example.com';

-- Business user
UPDATE profiles SET subscription_tier = 'business' 
WHERE email = 'bob@example.com';

-- Free user (no update needed, defaults to 'free')
-- charlie@example.com stays free

-- Verify
SELECT email, subscription_tier FROM profiles 
WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com');
```

**Result:**
```
| email               | subscription_tier |
|---------------------|------------------|
| alice@example.com   | pro              |
| bob@example.com     | business         |
| charlie@example.com | free             |
```

---

## 🧪 Testing

### Test as Free User
- Log in with free account
- Visit `/dashboard/support`
- **Should see:** "Upgrade to Pro or Business Plan" message
- **Button:** "Upgrade to Pro or Business Plan"

### Test as Pro User
- Update: `subscription_tier = 'pro'`
- Log in with pro account
- Refresh page (Ctrl+R)
- Visit `/dashboard/support`
- **Should see:** Ticket submission form
- **Can:** Create, view, and track support tickets

### Test as Business User
- Update: `subscription_tier = 'business'`
- Log in with business account
- Refresh page (Ctrl+R)
- Visit `/dashboard/support`
- **Should see:** Ticket submission form
- **Can:** Create, view, and track support tickets

---

## 🐛 Debug Mode

In **development**, the component shows debug info:

```
Debug: isPaidUser=true, localIsPro=false, user=alice@example.com
```

This tells you:
- `isPaidUser=true` → Access granted ✅
- `subscription_tier` shows which plan they're on
- `user` shows the logged-in email

---

## 🔐 Database Migration

The support tickets table already includes RLS policies:

```sql
-- Users can only see their own tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only Pro/Business can create tickets
-- (Enforced by component, not RLS)
```

---

## 📋 Checklist

- [ ] Verify `profiles` table has `subscription_tier` column
- [ ] Set test Pro user: `subscription_tier = 'pro'`
- [ ] Set test Business user: `subscription_tier = 'business'`
- [ ] Log in as Pro user and test
- [ ] Log in as Business user and test
- [ ] Log in as Free user and verify upgrade message
- [ ] Check browser console (F12) for debug info
- [ ] Refresh page if needed (Ctrl+R)

---

## 📞 Troubleshooting

### Issue: Still showing "Upgrade" for Pro/Business user

**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Check browser console (F12) for debug info
3. Run SQL query to verify `subscription_tier` is set
4. Try in incognito window (clears cache)

### Issue: Column doesn't exist

**Solution:**
```sql
-- Add missing column
ALTER TABLE profiles 
ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
```

### Issue: Update didn't work

**Solution - Find the correct user ID:**
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- Use this ID in the UPDATE query
```

---

## 🎯 Production Deployment

When Stripe payment is set up:

```javascript
// After successful payment:
await supabase
  .from('profiles')
  .update({ 
    subscription_tier: 'pro', // or 'business'
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  })
  .eq('id', userId);
```

---

## 📝 Summary

| Plan | Access | Setup |
|------|--------|-------|
| Free | ❌ Locked | No action needed |
| Pro | ✅ Granted | `subscription_tier = 'pro'` |
| Business | ✅ Granted | `subscription_tier = 'business'` |

---

**Last Updated:** April 12, 2026  
**Status:** ✅ Ready for Production
