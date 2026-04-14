-- Add missing DELETE RLS policies for support_tickets table

-- RLS Policy: Users can delete their own tickets
CREATE POLICY "Users can delete own support tickets"
  ON support_tickets
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Admin can delete any ticket
CREATE POLICY "Admin can delete support tickets"
  ON support_tickets
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
