# Priority Support - Pro Status Fix Guide

## Issue
Priority Support page is showing "Upgrade to Pro" message even for Pro users.

## Root Cause
The component checks `profiles.is_pro` column, but it may not be set correctly for your user account.

---

## 🔧 Quick Fix

### Option 1: Update User's Profile (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Database** → **profiles** table
3. Find your user row
4. Update the `is_pro` column to `true`

```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET is_pro = TRUE 
WHERE id = 'YOUR_USER_ID';
```

### Option 2: Add subscription_tier Column

If your schema uses `subscription_tier` instead of `is_pro`:

```sql
-- Check which user ID you need
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Update the subscription tier
UPDATE profiles 
SET subscription_tier = 'pro' 
WHERE id = 'YOUR_USER_ID';
```

---

## 🐛 Debug Steps

### Check Console Logs

Open browser DevTools (F12) → **Console** tab and look for:

```
Pro status check: { 
  is_pro: false, 
  subscription_tier: null, 
  isProUser: false 
}
```

This tells you what the component is reading from the database.

### See Debug Info on Page

In **development mode**, the page shows debug info at the bottom:

```
Debug: isPro=false, localIsPro=false, user=your-email@gmail.com
```

### Test the Query Directly

In Supabase SQL Editor:

```sql
SELECT id, email, is_pro, subscription_tier 
FROM profiles 
WHERE id = 'YOUR_USER_ID';
```

---

## ✅ What the Component Now Checks

The component checks in this order:

1. **`localIsPro`** from AuthContext (fastest)
2. **`is_pro`** column in profiles table
3. **`subscription_tier`** = 'pro' or 'business'

If any of these are true → **Pro user gets access** ✅

---

## 📝 For Full Pro Access

Make sure your **profiles** table has at least one of:

```sql
-- Option A: is_pro column (boolean)
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;

-- Option B: subscription_tier column (text)
ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
-- Values: 'free', 'pro', 'business'

-- Option C: Better - have both!
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
```

---

## 🔍 Verification Checklist

- [ ] User has `is_pro = true` OR `subscription_tier = 'pro'/'business'`
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Refreshed the page (Ctrl+R)
- [ ] Check console for debug info
- [ ] User is actually logged in (check email shown)

---

## 🚀 Permanent Fix

For **production**, when users upgrade to Pro:

```javascript
// When Stripe payment completes:
await supabase
  .from('profiles')
  .update({ 
    is_pro: true,
    subscription_tier: 'pro',
    stripe_customer_id: customerId,
    updated_at: new Date()
  })
  .eq('id', userId);
```

---

## 📞 Still Not Working?

1. **Check Supabase connection** - Make sure you're using the right Supabase instance
2. **Check RLS policies** - Make sure users can read their own profiles:
   ```sql
   SELECT * FROM pg_policies WHERE relname = 'profiles';
   ```
3. **Check user ID** - Make sure the logged-in user ID matches the profile ID
4. **Hard refresh** - Press `Ctrl+Shift+R` (hard refresh with cache clear)
5. **Check browser DevTools** → Network tab for failed requests

---

## 🎯 After Fixing

Once you set `is_pro = true`:

1. Refresh the page
2. You should see the **ticket submission form**
3. You can submit support tickets
4. You'll see your ticket history on the right

---

**Status:** ✅ Fixed in latest version  
**Last Updated:** April 12, 2026
