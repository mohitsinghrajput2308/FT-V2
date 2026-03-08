/**
 * useSubscription — React hook to read the current user's Paddle subscription
 * from Supabase and provide helpers to open checkout or the portal.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { openPaddleCheckout, openPaddlePortal, PADDLE_PRICE_IDS, initPaddle } from '../utils/paddle';

// ── localStorage cache helpers ────────────────────────────────────────────────
// Caches the resolved subscription + user email so badges and plan-gates render
// instantly on every re-mount (tab focus, navigation) with no Supabase flash.
const CACHE_KEY = 'ft_sub_v1';
function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? null; } catch { return null; }
}
function writeCache(data, email) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, _email: email ?? '' })); } catch { /* storage unavailable */ }
}
function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}
// ─────────────────────────────────────────────────────────────────────────────

export function useSubscription() {
  // Read cache once on init — extract sub data and the stored email separately
  const _cached = readCache();
  const _cachedSub = _cached ? (({ _email, ...rest }) => rest)(_cached) : null;
  const _cachedEmail = _cached?._email ?? '';

  // Initialise from cache so the plan is correct on first render
  const [subscription, setSubscription] = useState(() => _cachedSub);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Load user + subscription on mount
  useEffect(() => {
    initPaddle();

    const load = async () => {
      // Use getSession() (reads localStorage, no network lock) instead of
      // getUser() (network call) to avoid NavigatorLockAcquireTimeoutError
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        // Logged out — clear cache so a subsequent login starts fresh
        clearCache();
        setSubscription({ plan: 'free', status: 'active' });
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle();

      const resolved = data ?? { plan: 'free', status: 'active' };
      setSubscription(resolved);
      writeCache(resolved, u.email);   // persist sub + email for instant display on next mount
      setLoading(false);
    };

    load();

    // Re-fetch when user auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => load());
    return () => authSub.unsubscribe();
  }, []);

  // ── Tester bypass (dev/QA only) ───────────────────────────────────────────
  // These two accounts always receive a forced plan regardless of DB state.
  // Fall back to _cachedEmail so the bypass fires on first render before
  // getSession() resolves — eliminates the "free" flash for tester accounts.
  const TESTER_PRO_EMAIL = 'storagearea7070707070@gmail.com';
  const TESTER_BUSINESS_EMAIL = 'storagearea1010101010@gmail.com';
  const testerEmail = user?.email ?? _cachedEmail;
  const isTesterPro = testerEmail === TESTER_PRO_EMAIL;
  const isTesterBusiness = testerEmail === TESTER_BUSINESS_EMAIL;
  // ─────────────────────────────────────────────────────────────────────────

  /** Is the user on a paid active plan? */
  const isPro = isTesterPro || (subscription?.plan === 'pro' && ['active', 'trialing'].includes(subscription?.status));
  const isBusiness = isTesterBusiness || (subscription?.plan === 'business' && ['active', 'trialing'].includes(subscription?.status));
  const isPaid = isPro || isBusiness;
  const isTrialing = !isTesterPro && !isTesterBusiness && subscription?.status === 'trialing';

  /**
   * Open Paddle checkout for a plan.
   * @param {'pro'|'business'} plan
   * @param {'monthly'|'yearly'} cycle
   */
  const subscribe = useCallback(async (plan, cycle = 'monthly') => {
    if (!user) {
      console.warn('[useSubscription] User not logged in — redirect to auth first');
      return;
    }
    const priceId = PADDLE_PRICE_IDS[plan]?.[cycle];
    if (!priceId) {
      console.error('[useSubscription] Unknown plan/cycle:', plan, cycle);
      return;
    }
    openPaddleCheckout({
      priceId,
      userId: user.id,
      email: user.email,
      onSuccess: async () => {
        // Re-fetch subscription after checkout and update cache
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        const resolved = data ?? { plan: 'free', status: 'active' };
        setSubscription(resolved);
        writeCache(resolved);
      },
    });
  }, [user]);

  /** Open Paddle customer portal to manage / cancel */
  const manageSubscription = useCallback(() => {
    openPaddlePortal(subscription?.paddle_customer_id);
  }, [subscription]);

  return {
    subscription,
    loading,
    user,
    isPaid,
    isPro,
    isBusiness,
    isTrialing,
    plan: isTesterBusiness ? 'business' : isTesterPro ? 'pro' : (subscription?.plan ?? 'free'),
    status: (isTesterPro || isTesterBusiness) ? 'active' : (subscription?.status ?? 'active'),
    subscribe,
    manageSubscription,
  };
}
