/**
 * Edge Function: plaid-exchange-token
 *
 * Exchanges a Plaid public_token for a permanent access_token and stores
 * the linked institution in the plaid_items table.
 *
 * Required Supabase Edge Function env vars:
 *   PLAID_CLIENT_ID  — from https://dashboard.plaid.com
 *   PLAID_SECRET     — Sandbox or Production secret
 *   PLAID_ENV        — 'sandbox' | 'development' | 'production'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAID_CLIENT_ID      = Deno.env.get('PLAID_CLIENT_ID')!;
const PLAID_SECRET         = Deno.env.get('PLAID_SECRET')!;
const PLAID_ENV            = Deno.env.get('PLAID_ENV') ?? 'sandbox';
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PLAID_BASE = `https://${PLAID_ENV}.plaid.com`;

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Auth
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { public_token, metadata } = await req.json();
    if (!public_token) throw new Error('Missing public_token');

    // Exchange public_token → access_token + item_id
    const exchRes = await fetch(`${PLAID_BASE}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    });
    if (!exchRes.ok) throw new Error(`Plaid exchange failed: ${await exchRes.text()}`);
    const { access_token, item_id } = await exchRes.json();

    // Store in plaid_items table (create it via migration if needed)
    const { error: dbError } = await supabase.from('plaid_items').upsert({
      user_id: user.id,
      item_id,
      // access_token is encrypted server-side — never expose to client
      access_token_encrypted: access_token, // TODO: encrypt with SUPABASE_SERVICE_ROLE_KEY before storing
      institution_id:   metadata?.institution?.institution_id ?? null,
      institution_name: metadata?.institution?.name ?? null,
      linked_at: new Date().toISOString(),
    }, { onConflict: 'item_id' });

    if (dbError) throw new Error(`DB error: ${dbError.message}`);

    return new Response(
      JSON.stringify({ ok: true, institution: metadata?.institution?.name ?? 'Bank' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
