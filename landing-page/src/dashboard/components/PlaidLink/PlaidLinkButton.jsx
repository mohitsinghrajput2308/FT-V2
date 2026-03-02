/**
 * PlaidLinkButton — Bank Account Linking via Plaid Link SDK
 *
 * Flow:
 *   1. User clicks "Connect Bank Account"
 *   2. We call the /plaid-create-link-token Edge Function → get link_token
 *   3. Plaid Link modal opens in the browser
 *   4. On success, we exchange the public_token via /plaid-exchange-token Edge Function
 *   5. We store the connected account in Supabase (plaid_items table)
 *
 * Required env vars in Supabase Edge Functions:
 *   PLAID_CLIENT_ID     — from https://dashboard.plaid.com
 *   PLAID_SECRET        — Sandbox / Production secret
 *   PLAID_ENV           — 'sandbox' | 'production'
 *
 * Plaid SDK is loaded dynamically from CDN — no npm install needed.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Building2, Loader2, CheckCircle, AlertCircle, Link } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const PLAID_LINK_URL = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
const EDGE_FUNCTION_BASE = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`;

// ── Load Plaid Link SDK dynamically ──────────────────────────────────────────

function usePlaidScript() {
  const [ready, setReady] = useState(!!window.Plaid);
  useEffect(() => {
    if (window.Plaid) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = PLAID_LINK_URL;
    script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
    return () => { /* no cleanup — keep the script */ };
  }, []);
  return ready;
}

// ── Component ─────────────────────────────────────────────────────────────────

const PlaidLinkButton = ({ onSuccess, onError, className = '' }) => {
  const plaidReady = usePlaidScript();
  const [status, setStatus] = useState('idle'); // idle | loading | linked | error
  const [linkedBank, setLinkedBank] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnect = useCallback(async () => {
    if (!plaidReady) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      // 1. Get a link token from our Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${EDGE_FUNCTION_BASE}/plaid-create-link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to create link token (${res.status})`);
      const { link_token } = await res.json();

      // 2. Open Plaid Link modal
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token, metadata) => {
          // 3. Exchange public token for access token (server-side)
          const exchRes = await fetch(`${EDGE_FUNCTION_BASE}/plaid-exchange-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ public_token, metadata }),
          });
          if (!exchRes.ok) throw new Error('Token exchange failed');
          const result = await exchRes.json();
          setLinkedBank(metadata?.institution?.name ?? 'Your Bank');
          setStatus('linked');
          onSuccess?.(result);
        },
        onExit: (err) => {
          if (err) {
            setErrorMsg(err.display_message ?? 'Connection cancelled.');
            setStatus('error');
            onError?.(err);
          } else {
            setStatus('idle');
          }
        },
        onLoad: () => {},
        onEvent: () => {},
      });

      handler.open();
    } catch (err) {
      console.error('[PlaidLinkButton]', err);
      setErrorMsg(err.message ?? 'Something went wrong. Try again.');
      setStatus('error');
      onError?.(err);
    }
  }, [plaidReady, onSuccess, onError]);

  // ── Render states ─────────────────────────────────────────────────────────

  if (status === 'linked') {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ${className}`}>
        <CheckCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">{linkedBank} connected successfully</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleConnect}
        disabled={status === 'loading' || !plaidReady}
        className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all
          bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Building2 className="w-4 h-4" />
        }
        {status === 'loading' ? 'Connecting…' : 'Connect Bank Account'}
        {status !== 'loading' && <Link className="w-3.5 h-3.5 opacity-60" />}
      </button>

      {status === 'error' && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Powered by Plaid — 256-bit encryption, read-only access
      </p>
    </div>
  );
};

export default PlaidLinkButton;
