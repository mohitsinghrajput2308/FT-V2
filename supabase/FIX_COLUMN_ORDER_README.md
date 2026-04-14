# Fix Support Tickets Column Order

## Issue
The `user_name` and `user_email` columns are showing as NULL or appearing after `id` and `uid` columns in the Supabase table editor.

## Solution
Run the migration to reorder columns so `user_name` and `user_email` appear FIRST (before `id` and `uid`).

---

## Step-by-Step Fix

### 1. Go to Supabase SQL Editor
- Open your Supabase dashboard
- Navigate to **SQL Editor**

### 2. Run the Migration
Copy and paste the entire content of:
```
supabase/migration_027_fix_ticket_column_order.sql
```

### 3. Execute
- Click **Run** button
- Wait for completion (should take a few seconds)

---

## What This Does

✅ Recreates the `support_tickets` table with correct column order:
- `user_name` (VARCHAR) - **FIRST**
- `user_email` (VARCHAR) - **SECOND**  
- `id` (UUID) - **THIRD**
- `user_id` (UUID)
- `subject`, `description`, etc.

✅ Preserves all existing data
✅ Recreates all indexes
✅ Recreates all RLS policies

---

## After Migration

The Supabase table editor will now display columns in this order:

| user_name | user_email | id | user_id | subject | description | category | priority | status | response | created_at | updated_at |
|-----------|-----------|-------|---------|---------|-------------|----------|----------|--------|----------|-----------|-----------|
| kkj | storagearea101010... | 4b9a8f4c-... | b4589d36-... | 99999 | 9999999999 | Technical Issue | medium | open | NULL | 2026-04-12... | 2026-04-12... |

---

## Next New Tickets

When users create support tickets now, both `user_name` and `user_email` will be automatically captured and will display prominently at the beginning of each row.

---

## ❌ If You Get an Error

**Common error**: "Violates foreign key constraint"

**Solution**: This migration runs in a transaction, so either:
- All changes apply successfully
- If error occurs, the entire transaction rolls back (no data loss)

Try running again, or contact support if persistent issues.

---

## Verify It Worked

1. Go to Supabase → **Table Editor**
2. Click on `support_tickets` table
3. Check that column order is now: **user_name, user_email, id, user_id, subject...**

✅ Done! New tickets will now have proper user information display.
