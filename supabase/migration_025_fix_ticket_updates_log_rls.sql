-- Fix ticket_updates_log RLS policies
-- The trigger that logs status changes was being blocked because the table had no INSERT policy

-- Drop existing policies on ticket_updates_log
DROP POLICY IF EXISTS "Users can view ticket updates for their tickets" ON public.ticket_updates_log;
DROP POLICY IF EXISTS "System can insert ticket updates" ON public.ticket_updates_log;

-- Enable RLS
ALTER TABLE public.ticket_updates_log ENABLE ROW LEVEL SECURITY;

-- Allow users to view updates on their own tickets
CREATE POLICY "Users can view ticket updates for their tickets"
  ON public.ticket_updates_log FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
    )
  );

-- Allow SERVICE ROLE and AUTHENTICATED to insert (for the trigger to work)
-- The trigger will insert the record when anyone updates a ticket
CREATE POLICY "Allow inserts for audit logging"
  ON public.ticket_updates_log FOR INSERT
  WITH CHECK (true);

SELECT 'ticket_updates_log RLS policies fixed!' as status;
