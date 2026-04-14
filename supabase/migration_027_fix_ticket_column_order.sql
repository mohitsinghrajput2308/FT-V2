-- Migration to fix column order in support_tickets
-- Recreates the table with user_name and user_email before id and uid

BEGIN;

-- Create new table with correct column order
CREATE TABLE support_tickets_new (
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy data from old table to new table
INSERT INTO support_tickets_new 
  (user_name, user_email, id, user_id, subject, description, category, priority, status, response, created_at, updated_at)
SELECT 
  user_name, user_email, id, user_id, subject, description, category, priority, status, response, created_at, updated_at
FROM support_tickets;

-- Drop old table and rename new one
DROP TABLE IF EXISTS support_tickets CASCADE;
ALTER TABLE support_tickets_new RENAME TO support_tickets;

-- Re-enable Row-Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update support tickets"
  ON support_tickets
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Recreate indexes
CREATE INDEX support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX support_tickets_status_idx ON support_tickets(status);
CREATE INDEX support_tickets_created_at_idx ON support_tickets(created_at DESC);
CREATE INDEX support_tickets_user_email_idx ON support_tickets(user_email);
CREATE INDEX support_tickets_user_name_idx ON support_tickets(user_name);

COMMIT;
