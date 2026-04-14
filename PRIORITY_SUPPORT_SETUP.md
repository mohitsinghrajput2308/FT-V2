# Priority Support System - Setup Guide

## 🎯 Overview

The Priority Support system is a **ticket-based support feature** exclusively for **Pro and Business plan subscribers**. Users can:

- ✅ Submit support tickets with subject, description, category, and priority
- ✅ Track ticket status (open, in-progress, resolved, closed)
- ✅ Receive responses from your support team within 24 hours
- ✅ View ticket history and support responses
- ✅ Free users see an upgrade prompt

---

## 📋 What Was Created

### New Files

1. **landing-page/src/dashboard/pages/PrioritySupport.jsx**
   - Ticket submission form
   - Ticket list with filtering
   - Ticket detail view
   - Pro/free user gating

2. **supabase/migration_020_support_tickets.sql**
   - Creates `support_tickets` table
   - Adds Row-Level Security (RLS) policies
   - Sets up indexes for performance

### Updated Files

1. **landing-page/src/dashboard/DashboardApp.jsx**
   - Added PrioritySupport import
   - Added `/dashboard/support` route

2. **landing-page/src/dashboard/components/Layout/Sidebar.jsx**
   - Added Priority Support menu item
   - Added MessageCircle icon import

---

## 🚀 Setup Instructions

### Step 1: Apply Database Migration

Go to [Supabase Dashboard](https://supabase.com/dashboard) and run the SQL migration:

```bash
# Option A: Copy the migration from supabase/migration_020_support_tickets.sql
# and run it in Supabase SQL Editor

# Option B: Use Supabase CLI (if installed)
supabase migration up
```

**Migration creates:**
- `support_tickets` table with fields:
  - `id` (UUID primary key)
  - `user_id` (foreign key to auth.users)
  - `subject` (max 100 chars)
  - `description` (max 1000 chars)
  - `category` (general, technical, billing, feature-request)
  - `priority` (low, medium, high)
  - `status` (open, in-progress, resolved, closed)
  - `response` (support team's response)
  - `created_at`, `updated_at` (timestamps)

- **Row-Level Security (RLS):**
  - Users can only view their own tickets
  - Users can only create tickets for themselves
  - Support admins can view/update all tickets

---

### Step 2: Verify User is Pro

The component checks the `profiles.is_pro` column. Make sure your **profiles table** has this field:

```sql
-- Check if is_pro exists
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT FALSE;

-- When user upgrades to Pro/Business, set:
UPDATE profiles SET is_pro = TRUE WHERE id = user_id;
```

---

### Step 3: Create Support Admin Role (Optional)

If you want your support team to manage tickets:

```sql
-- Create a service role user for admin panel
-- Add to your profiles table:
ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
-- SET role = 'admin' for support team members

-- Update RLS policy to allow admins to view/update
-- (Already included in migration)
```

---

## 🎨 Features

### User Features (Pro/Business only)

**Submit Tickets:**
- Subject & detailed description
- Category selector (General, Technical, Billing, Feature Request)
- Priority selector (Low, Medium, High)
- Character limits (subject: 100, description: 1000)
- Real-time submission feedback

**View Tickets:**
- List all submitted tickets
- See ticket status (open, in-progress, resolved)
- View support team responses
- Filter by priority and status
- Sort by creation date

**Free User Prompt:**
- Shows upgrade button to Pro plan
- Lists benefits of Pro support
- Links directly to upgrade page

### UI Features

- 🎯 Clean, modern design matching FinTrack theme
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Real-time updates when tickets are created
- 🔔 Toast notifications for success/error
- ♿ Accessible form controls

---

## 🔧 How to Use

### For Users

1. Click **"Priority Support"** in dashboard sidebar (Pro users only)
2. Fill out the ticket form:
   - Select category (what it's about)
   - Select priority (urgency)
   - Write subject line
   - Describe the issue
3. Click **"Submit Ticket"**
4. View your tickets in the right sidebar
5. Support team responds within 24 hours

### For Support Team (Dashboard)

Create a simple admin dashboard:

```jsx
// Example: dashboard/pages/AdminSupport.jsx
import { supabase } from '../../lib/supabase';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch ALL tickets for admin
    supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setTickets(data));
  }, []);

  const respondToTicket = async (ticketId, response) => {
    await supabase
      .from('support_tickets')
      .update({ response, status: 'resolved' })
      .eq('id', ticketId);
  };

  // Render admin UI to respond to tickets
}
```

---

## 📊 Database Schema

### support_tickets Table

```
┌─────────────────────┬──────────────┬───────────────┐
│ Column              │ Type         │ Notes         │
├─────────────────────┼──────────────┼───────────────┤
│ id                  │ UUID         │ Primary Key   │
│ user_id             │ UUID FK      │ To auth.users │
│ subject             │ VARCHAR(100) │ Max 100 chars │
│ description         │ TEXT         │ Max 1000      │
│ category            │ VARCHAR(50)  │ 4 categories  │
│ priority            │ VARCHAR(20)  │ 3 levels      │
│ status              │ VARCHAR(20)  │ 4 statuses    │
│ response            │ TEXT         │ Admin reply   │
│ created_at          │ TIMESTAMP    │ Auto          │
│ updated_at          │ TIMESTAMP    │ Auto          │
└─────────────────────┴──────────────┴───────────────┘
```

---

## 🔒 Security

### Row-Level Security (RLS)

✅ Users can only see their own tickets
✅ Users can only create tickets for themselves
✅ Support admins (role = 'admin') can see all tickets
✅ Only authenticated users can access
✅ No direct database access from client

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
// In PrioritySupport.jsx - Add validation
const MAX_TICKETS_PER_DAY = 5;

const handleSubmit = async (e) => {
  // Check user's ticket count today
  const { count } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .eq('user_id', currentUser.id)
    .gte('created_at', new Date().toISOString().split('T')[0]);
  
  if (count >= MAX_TICKETS_PER_DAY) {
    notifyError('You can submit max 5 tickets per day');
    return;
  }
  
  // ... continue with submit
};
```

---

## 🔗 Integration Points

### Pricing Page

Update pricing to mention Priority Support:

```jsx
// In landing-page/src/pages/PricingPage.jsx
features: [
  'Priority Support (24-hour response)',  // ← Add this
  'AI Assistant',
  ...
]
```

### Dashboard Pricing Page

Update dashboard pricing to show access to support:

```jsx
// landing-page/src/dashboard/pages/DashboardPricing.jsx
features: [
  'Priority Support Tickets',  // ← Add this
  '5 budgets/goals/bills',
  ...
]
```

---

## 📊 Analytics & Monitoring

### Track Metrics

```sql
-- Response time
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_hours
FROM support_tickets
WHERE status IN ('resolved', 'closed');

-- Tickets by category
SELECT category, COUNT(*) as count
FROM support_tickets
GROUP BY category;

-- Tickets by priority
SELECT priority, COUNT(*) as count
FROM support_tickets
GROUP BY priority;
```

### Monitor in Real-Time

Consider adding a TypeScript webhook handler to:
- Send email notifications when tickets are created
- Send SMS alerts for high-priority tickets
- Auto-respond with ticket confirmation

---

## 🚨 Troubleshooting

### Issue: "Priority Support" menu item not showing

**Solution:** Restart the development server
```bash
npm start
```

### Issue: Cannot submit tickets (403 error)

**Solution:** Check RLS policies in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Run `SELECT * FROM pg_policies WHERE relname = 'support_tickets'`
3. Verify policies are in place

### Issue: Form doesn't show for Pro users

**Solution:** Check `profiles.is_pro` column:
```sql
SELECT id, is_pro FROM profiles WHERE id = 'YOUR_USER_ID';
```

If false, update it:
```sql
UPDATE profiles SET is_pro = TRUE WHERE id = 'YOUR_USER_ID';
```

---

## 🎓 Next Steps

### Optional Enhancements

1. **Email Notifications**
   ```jsx
   // Send email when ticket is created
   await supabase.functions.invoke('send-email', {
     body: { 
       ticketId: data.id, 
       email: user.email,
       subject: formData.subject
     }
   });
   ```

2. **Ticket Search & Filtering**
   ```jsx
   // Add search box
   const [searchTerm, setSearchTerm] = useState('');
   const filtered = tickets.filter(t => 
     t.subject.includes(searchTerm)
   );
   ```

3. **Admin Dashboard**
   - View all tickets across all users
   - Filter by status/priority/category
   - Respond to tickets
   - Analytics dashboard

4. **Automatic Responses**
   - Send confirmation email when ticket is created
   - Send reminder if not responded in 24 hours
   - Auto-close old resolved tickets

5. **Slack Integration**
   - Post new tickets to Slack channel
   - Update Slack when tickets are resolved

---

## 📝 Environment Variables

No new environment variables needed! Uses existing Supabase credentials.

---

## ✅ Checklist

- [ ] Applied database migration
- [ ] Verified `profiles.is_pro` column exists
- [ ] Component appears in sidebar
- [ ] Can submit tickets (as Pro user)
- [ ] Can view ticket list
- [ ] Free users see upgrade prompt
- [ ] RLS policies are working
- [ ] Email notifications (optional) set up

---

## 📞 Support

For issues or questions:
1. Check Supabase logs: Dashboard → Logs → Database
2. Check browser console for errors
3. Review RLS policies in Supabase
4. Verify user `is_pro` status

---

**Created:** April 12, 2026  
**Component:** PrioritySupport.jsx  
**Database:** support_tickets table  
**Status:** ✅ Ready to use
