-- Support Tickets Table for Priority Support Feature
-- Only Pro/Business users can access

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'general', 'technical', 'billing', 'feature-request'
  priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in-progress', 'resolved', 'closed'
  response TEXT, -- Support team response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tickets
CREATE POLICY "Users can create support tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admin can view all tickets (for support team)
CREATE POLICY "Admin can view all support tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policy: Admin can update tickets
CREATE POLICY "Admin can update support tickets"
  ON support_tickets
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create index for faster queries
CREATE INDEX support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX support_tickets_status_idx ON support_tickets(status);
CREATE INDEX support_tickets_created_at_idx ON support_tickets(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE support_tickets IS 'Support tickets for Pro/Business users. Only Pro and Business plan subscribers can create tickets.';
