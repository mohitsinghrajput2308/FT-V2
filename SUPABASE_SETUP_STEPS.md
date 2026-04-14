# Complete Setup Guide - Pro & Business Plan Users

---

## 🚀 Step 1: Create the subscription_tier Column (REQUIRED - DO THIS FIRST)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
```

**This applies to ALL users** (Pro, Business, and Free)

✅ After success, you'll see: `"success - executed successfully"`

---

## 📋 Step 2: Choose Your Plan & Run the Right SQL

### ✅ For PRO PLAN Users:

```sql
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');
```

**Replace:** `'your-email@gmail.com'` with your actual email

---

### ✅ For BUSINESS PLAN Users:

```sql
UPDATE profiles 
SET subscription_tier = 'business'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');
```

**Replace:** `'your-email@gmail.com'` with your actual email

---

## 🔍 Step 3: Verify It Worked

Run this to check:

```sql
SELECT id, email, subscription_tier FROM profiles 
WHERE email = 'your-email@gmail.com';
```

**You should see:**

**For Pro User:**
```
| email                 | subscription_tier |
|----------------------|------------------|
| your-email@gmail.com  | pro              |
```

**For Business User:**
```
| email                 | subscription_tier |
|----------------------|------------------|
| your-email@gmail.com  | business         |
```

---

## 🎯 Step 4: Refresh & Test Priority Support

1. **Refresh Page:** Press `Ctrl+Shift+R` (hard refresh)
2. **Log out** if needed, **log back in**
3. **Go to:** Dashboard → Priority Support (left sidebar)
4. **You should see:** ✅ Ticket submission form

**NOT the upgrade message!**

---

## 📊 Examples - All Three Plans

### Example 1: Set Up Multiple Users

```sql
-- Pro user
UPDATE profiles 
SET subscription_tier = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alice@example.com');

-- Business user  
UPDATE profiles 
SET subscription_tier = 'business'
WHERE id = (SELECT id FROM auth.users WHERE email = 'bob@example.com');

-- Verify all three
SELECT email, subscription_tier FROM profiles 
WHERE email IN ('alice@example.com', 'bob@example.com', 'free-user@example.com');
```

**Result:**
```
| email                  | subscription_tier |
|----------------------|------------------|
| alice@example.com      | pro              |
| bob@example.com        | business         |
| free-user@example.com  | free             |
```

---

## 🎥 Quick Video Guide (Text Version)

1. **Open Supabase Dashboard**
2. **Click:** SQL Editor (left sidebar)
3. **Paste Step 1** query → Click "Run"
4. **Wait for success**
5. **Paste YOUR plan's Step 2** query → Click "Run"
6. **Run Step 3** verification query
7. **Refresh FinTrack** in browser
8. **Check Priority Support** - should work now! ✅

---

## ✨ Complete Comparison Table

| Step | Pro User | Business User |
|------|----------|---------------|
| **Step 1 (Create Column)** | `ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';` | `ALTER TABLE profiles ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';` |
| **Step 2 (Set Plan)** | `UPDATE profiles SET subscription_tier = 'pro' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');` | `UPDATE profiles SET subscription_tier = 'business' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');` |
| **Result** | subscription_tier = `'pro'` | subscription_tier = `'business'` |
| **Priority Support Access** | ✅ Yes | ✅ Yes |
| **24-hour Response** | ✅ Yes | ✅ Yes |

---

## 🐛 Troubleshooting

### Issue: "Column already exists"
**Solution:** Skip Step 1, go straight to Step 2

### Issue: "Syntax error"
**Solution:** 
- Copy-paste the exact SQL (check for typos)
- Make sure email is in quotes: `'email@example.com'`
- Use your ACTUAL email address

### Issue: 0 rows updated
**Solution:** Verify your email is correct in auth.users
```sql
SELECT id, email FROM auth.users;
```

### Issue: Still not working after refresh
**Solution:**
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Close and reopen browser
4. Try incognito/private window

---

## 🎯 Success Checklist

- [ ] Step 1: Created `subscription_tier` column
- [ ] Step 2: Updated your user's subscription_tier to `'pro'` or `'business'`
- [ ] Step 3: Verified with SELECT query
- [ ] Step 4: Hard refreshed browser (Ctrl+Shift+R)
- [ ] Step 5: Can see Priority Support ticket form ✅

---

**Status:** ✅ Ready for both Pro and Business users  
**Created:** April 12, 2026
