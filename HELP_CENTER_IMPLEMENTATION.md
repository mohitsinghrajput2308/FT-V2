# Help Center Functionality - Implementation Guide

## Overview
The Help Center page has been fully refactored from a showcase implementation with hardcoded data to a **fully functional, database-backed system with real, authenticated articles**.

## What's Been Implemented

### 1. **Database Migration (Supabase)**
Created: `supabase/migration_025_help_articles.sql`

This migration creates:
- **`help_articles` table** with fields:
  - `id` - UUID primary key
  - `title` - Article title
  - `slug` - URL-friendly identifier
  - `content` - Full article content
  - `excerpt` - Short summary
  - `category` - One of: `getting_started`, `account_billing`, `features_howttos`, `troubleshooting`
  - `min_subscription_tier` - Access control: `free`, `pro`, or `business`
  - `sort_order` - Display order within category
  - `is_published` - Visibility flag
  - `created_at`, `updated_at` - Timestamps

- **Row-Level Security (RLS) Policies**:
  - Free users see all "free" tier articles
  - Pro users see "free" and "pro" tier articles  
  - Business users see all articles
  - All users see published articles only

- **Pre-populated with 45 Real Articles**:
  - 12 Getting Started articles
  - 8 Account & Billing articles
  - 15 Features & How-Tos articles
  - 10 Troubleshooting articles

### 2. **Frontend Component Update**
Updated: `landing-page/src/pages/HelpCenter.jsx`

Changes:
- ✅ **Dynamic Data Loading** - Fetches articles from Supabase in real-time
- ✅ **Category Selection** - Click categories to view articles within that section
- ✅ **Real Article Counts** - Displays actual number of accessible articles per category
- ✅ **Subscription-Aware** - Shows articles based on user's subscription tier (free/pro/business)
- ✅ **Search Functionality** - Filter articles by title, excerpt, or content
- ✅ **Loading States** - Spinner while fetching data
- ✅ **Error Handling** - User-friendly error messages if data fetch fails
- ✅ **Interactive Accordion** - Expandable articles with smooth animations
- ✅ **Authentication** - Only authenticated users see personalized tier-specific content

## Features

### For Users
1. **Browse by Category** - Click any category card to view all articles in that section
2. **Search** - Real-time search across title, excerpt, and content
3. **Subscription Tiers**:
   - **Free Users**: Access to 39 free articles
   - **Pro Users**: Access to 43 articles (adds multi-currency + pro features)
   - **Business Users**: Access to all 45 articles (adds API + business features)
4. **Read Full Articles** - Click to expand and read complete article content
5. **Responsive Design** - Works on desktop, tablet, and mobile

### For Admins/Content Team
1. Add new articles via SQL inserts into `help_articles` table
2. Control visibility with subscription tier settings
3. Reorder articles with `sort_order` field
4. Publish/unpublish articles with `is_published` flag
5. Track article creation and updates with `created_at`/`updated_at`

## How to Deploy

### Step 1: Run the Migration
Execute the SQL migration in your Supabase dashboard:

```bash
# Option 1: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of: supabase/migration_025_help_articles.sql
5. Run the query

# Option 2: Via CLI
supabase db push migration_025_help_articles.sql
```

### Step 2: Verify the Frontend
The component is already updated and will:
1. Auto-load on page mount
2. Fetch user subscription tier
3. Display articles based on access level
4. Show real article counts

### Step 3: Test the Features

**Test with Free User:**
1. Create a free account
2. Navigate to `/help-center`
3. Should see 39 articles (excluding pro/business-only ones)
4. Can click categories and search

**Test with Pro User:**
1. Create/upgrade to Pro account
2. Navigate to `/help-center`
3. Should see 43 articles (including some marked as 'pro')
4. If you had free articles already viewed, you'll now see more

**Test with Business User:**
1. Create/upgrade to Business account
2. Navigate to `/help-center`
3. Should see all 45 articles
4. Including business-exclusive content

## Article Management

### Add New Articles
```sql
INSERT INTO public.help_articles 
  (title, slug, content, excerpt, category, min_subscription_tier, sort_order) 
VALUES 
  ('Article Title', 'article-slug', 'Full content here...', 'Short excerpt', 'getting_started', 'free', 1);
```

### Update Article
```sql
UPDATE public.help_articles 
SET content = 'Updated content...', updated_at = NOW() 
WHERE slug = 'article-slug';
```

### Hide Article
```sql
UPDATE public.help_articles 
SET is_published = false 
WHERE slug = 'article-slug';
```

## Technical Details

### State Management
```javascript
- query: Search term
- selectedCategory: Currently viewing category (null = all)
- articles: All fetchable articles from database
- categoryCounts: Article count per category
- loading: Data loading state
- error: Error messages
- userSubscription: User's current plan (free/pro/business)
```

### Data Flow
```
1. Component mounted
   ↓
2. Fetch user's subscription tier from subscriptions table
   ↓
3. Fetch articles from help_articles table (RLS applies automatically)
   ↓
4. Calculate category counts
   ↓
5. Display dynamically based on selection/search
```

### RLS Security
The database automatically enforces:
- Free users can never see pro/business articles
- Pro users can never see business-only articles  
- Unauthenticated users see only free articles
- All enforcement happens at the database level (not frontend)

## What Was Removed

❌ Hardcoded `categories` array with fake counts
❌ Hardcoded `faqs` array with placeholder data
❌ Static FAQ display (replaced with dynamic articles)
❌ No real data source previously

## What's New

✅ Real Supabase article table with 45 articles
✅ Subscription-tier based access control
✅ Dynamic category counts
✅ Full search functionality
✅ Article expandable accordion
✅ Loading and error states
✅ Authentication integration
✅ RLS security policies

## Troubleshooting

### Articles not loading?
1. Verify migration was run successfully: Check Supabase SQL Editor
2. Check browser console for errors
3. Verify user subscription query works: SELECT * FROM subscriptions WHERE user_id = '<your-id>'
4. Check RLS policies: Go to Table > help_articles > Policies in Supabase

### Wrong article count?
1. Articles are filtered by `min_subscription_tier`
2. Free users can only see `min_subscription_tier = 'free'`
3. Check your subscription plan in Settings > Subscription

### Search not working?
1. Search is case-insensitive
2. Searches title, excerpt, and content fields
3. Try typing with different keywords
4. Works in real-time as you type

### Performance issues?
1. All queries have indexes on: category, published, sort_order
2. RLS policies are optimized
3. If slow, check Supabase query performance dashboard

## Future Enhancements

Possible additions:
- Article views/analytics tracking
- Related articles suggestions
- User ratings on articles
- Feedback system for articles
- Video embeds in articles
- AI-powered article recommendations
- Article translation/localization
- Archive/versions of articles

## Files Modified

1. `supabase/migration_025_help_articles.sql` - NEW
2. `landing-page/src/pages/HelpCenter.jsx` - UPDATED

## Support

For issues with this implementation:
1. Check the troubleshooting section above
2. Verify migration ran successfully
3. Check Supabase logs for RLS errors
4. Review browser console for frontend errors
5. Verify user subscription exists in database
