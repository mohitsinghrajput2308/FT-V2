# ✅ DEPLOYMENT CHECKLIST - Help Center Fix

## 📋 Pre-Deployment Verification

- [ ] Have read `DEPLOY_HELP_CENTER.md` guide
- [ ] Have access to Supabase dashboard
- [ ] Know your Supabase project URL
- [ ] Have project repo cloned locally
- [ ] Browser is ready to test

---

## 🚀 Deployment Steps (Copy-Paste)

### PHASE 1: Prepare Migration File

- [ ] Navigate to: `supabase/migration_025_help_articles.sql`
- [ ] Open the file in your editor
- [ ] Select all content: `Ctrl+A`
- [ ] Copy to clipboard: `Ctrl+C`
- [ ] Verify you see:
  - [ ] `-- Migration: Create help_articles table for HelpCenter`
  - [ ] `CREATE TABLE IF NOT EXISTS public.help_articles`
  - [ ] Multiple `INSERT INTO public.help_articles` statements
  - [ ] `CREATE POLICY` statements for RLS

### PHASE 2: Execute in Supabase

- [ ] Open browser
- [ ] Go to: `https://app.supabase.com/`
- [ ] Login to your account
- [ ] Select your FinTrack project
- [ ] Navigate to: **SQL Editor** (left sidebar)
- [ ] Click: **"New Query"** (top right)
- [ ] In the editor, Paste: `Ctrl+V`
- [ ] Verify all SQL is pasted (should be ~500 lines)
- [ ] Click: **"Run"** button (or press `Ctrl+Enter`)
- [ ] **WAIT ~2-3 seconds**
- [ ] Verify you see: **✅ Success** message
- [ ] If error appears, note it and troubleshoot

### PHASE 3: Verify Database

- [ ] In Supabase dashboard
- [ ] Go to: **Tables** (in sidebar)
- [ ] Look for: **`help_articles`** table
- [ ] Verify it exists and has data
- [ ] Click on it
- [ ] Verify you can see rows
- [ ] Check columns: `id, title, content, category, min_subscription_tier, etc.`
- [ ] Count rows (should be 45)

---

## 🧪 Testing in Your App

### PHASE 4: Test Free User

- [ ] Clear browser cache: `Ctrl+Shift+Delete`
- [ ] Navigate to: `http://localhost:3000/help-center`
- [ ] Verify page loads (no errors in console)
- [ ] See 4 category cards:
  - [ ] "Getting Started" with **12** articles
  - [ ] "Account & Billing" with **8** articles
  - [ ] "Features & How-Tos" with **15** articles (wait for DB load)
  - [ ] "Troubleshooting" with **10** articles
- [ ] Numbers should be **real** (not hardcoded)
- [ ] Click on each category:
  - [ ] "Getting Started" → shows 12 articles
  - [ ] "Account & Billing" → shows 8 articles
  - [ ] "Features & How-Tos" → shows 15 articles
  - [ ] "Troubleshooting" → shows 10 articles
- [ ] Try search: Type "budget"
  - [ ] Shows matching articles (2-3 results)
- [ ] Expand an article:
  - [ ] Click article title
  - [ ] Reads full content (not truncated)
  - [ ] ChevronDown icon rotates
- [ ] Collapse article:
  - [ ] Click again
  - [ ] Content hides smoothly
- [ ] Check browser console:
  - [ ] Press F12 → Console tab
  - [ ] No red errors
  - [ ] No network 404s

### PHASE 5: Test Pro/Business Users (Optional)

- [ ] Create/log in as Pro user
- [ ] Visit `/help-center`
- [ ] Verify count increases for "Features & How-Tos"
- [ ] Should show articles marked as "pro"
- [ ] Create/log in as Business user  
- [ ] Visit `/help-center`
- [ ] Should see all articles (45 total if you sum categories)

---

## ⚠️ Troubleshooting

### Issue: Migration failed with error

**Solution:**
- [ ] Copy the error message
- [ ] Check if table already exists (you can ignore this)
- [ ] If syntax error: Verify entire SQL file was copied
- [ ] If permissions error: Check Supabase permissions
- [ ] Try again: Clear browser → New Query → Paste → Run

### Issue: Website shows spinner forever

**Solution:**
- [ ] Hard refresh: `Ctrl+Shift+R`
- [ ] Check console (F12): Any errors?
- [ ] Verify migration actually ran
- [ ] Check Supabase > Tables > help_articles exists
- [ ] If user logged in: Verify subscription table has data

### Issue: No articles showing

**Solution:**
- [ ] Migration might not have run (check Supabase)
- [ ] Page might be loading (wait 3 seconds)
- [ ] Check console: Any errors?
- [ ] Hard refresh browser: `Ctrl+Shift+R`
- [ ] Check subscription table has entries

### Issue: Search not working

**Solution:**
- [ ] Type valid search term (e.g., "budget")
- [ ] Filter is case-insensitive
- [ ] Must match title, excerpt, or content
- [ ] Try different keywords
- [ ] Reload page if still broken

### Issue: Wrong article count

**Solution:**
- [ ] Free users see only free articles
- [ ] Pro users see free + pro articles
- [ ] Business users see all articles
- [ ] Check your current subscription: Settings > Subscription
- [ ] If Free but seeing Pro content: RLS not working?

---

## 📊 Success Verification

Deployment is successful if you can check all these:

**Database Level:**
- [ ] Supabase shows `help_articles` table exists
- [ ] Table has 45 rows
- [ ] Columns include: `id, title, content, category, min_subscription_tier`
- [ ] RLS policies are created (check Policies tab)

**Frontend Level:**
- [ ] `/help-center` loads without errors
- [ ] 4 category cards display with **real numbers**
- [ ] Clicking category filters articles
- [ ] Search box filters articles in real-time
- [ ] Clicking article shows full content
- [ ] Console has no red errors
- [ ] Different users see different access levels

**Functional Level:**
- [ ] Free user sees 35 articles
- [ ] Pro user sees 40 articles
- [ ] Business user sees 45 articles
- [ ] Search works across title/content
- [ ] All articles are readable

---

## 🎯 Final Steps

- [ ] Database migration completed: ✅
- [ ] Frontend tested and working: ✅
- [ ] All 4 categories functional: ✅
- [ ] Search tested: ✅
- [ ] Subscription tiers verified: ✅
- [ ] No console errors: ✅
- [ ] Ready for production: ✅

---

## 📋 Deployment Summary

```
START HERE: DEPLOY_HELP_CENTER.md
           ↓
    Run migration in Supabase
           ↓
    Test at /help-center
           ↓
       ✅ DONE
```

---

## 🎉 Deployment Complete

If all checkboxes above are checked, your help center is now:
- ✅ Fully functional
- ✅ Data-driven from Supabase
- ✅ Subscription-aware
- ✅ Production-ready
- ✅ No more fake data

**Congratulations!** 🚀

---

## 📞 Questions?

**Not sure about a step?** → Check `DEPLOY_HELP_CENTER.md`
**Technical question?** → Check `HELP_CENTER_IMPLEMENTATION.md`
**General question?** → Check `README_HELP_CENTER.md`

All guides are in your project root directory.

---

**Last Updated:** April 14, 2026
**Status:** ✅ Ready for Deployment
**Estimated Deployment Time:** 2-5 minutes
