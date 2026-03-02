/**
 * Edge Function: plaid-create-link-token
 *
 * Creates a Plaid Link token so the client can open the Plaid Link modal.
 *
 * Required Supabase Edge Function env vars:
 *   PLAID_CLIENT_ID  — from https://dashboard.plaid.com
 *   PLAID_SECRET     — Sandbox or Production secret
 *   PLAID_ENV        — 'sandbox' | 'development' | 'production'
 *
 * Called by PlaidLinkButton.jsx before opening the Plaid modal.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID')!;
const PLAID_SECRET    = Deno.env.get('PLAID_SECRET')!;
const PLAID_ENV       = Deno.env.get('PLAID_ENV') ?? 'sandbox';
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PLAID_BASE = `https://${PLAID_ENV}.plaid.com`;

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Authenticate the caller via Supabase JWT
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Create Plaid link token
    const plaidRes = await fetch(`${PLAID_BASE}/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        client_name: 'FinTrack',
        user: { client_user_id: user.id },
        products: ['transactions'],
        country_codes: ['US', 'GB', 'CA', 'AU', 'IN'],
        language: 'en',
      }),
    });

    if (!plaidRes.ok) {
      const err = await plaidRes.text();
      throw new Error(`Plaid error: ${err}`);
    }

    const { link_token } = await plaidRes.json();
    return new Response(
      JSON.stringify({ link_token }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
