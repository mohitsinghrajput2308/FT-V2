-- Add user information columns to support_tickets table
-- This allows support team to see user details without joining to auth.users

ALTER TABLE support_tickets
ADD COLUMN user_name VARCHAR(255),
ADD COLUMN user_email VARCHAR(255);

-- Add indexes for user lookup
CREATE INDEX support_tickets_user_email_idx ON support_tickets(user_email);
CREATE INDEX support_tickets_user_name_idx ON support_tickets(user_name);

-- Add comment
COMMENT ON COLUMN support_tickets.user_name IS 'User display name - captured at ticket creation';
COMMENT ON COLUMN support_tickets.user_email IS 'User email address - captured at ticket creation for easy contact';
