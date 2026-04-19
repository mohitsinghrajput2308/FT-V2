/**
 * useSubscription — React hook to read the current user's Paddle subscription
 * from Supabase and provide helpers to open checkout or the portal.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { openPaddleCheckout, openPaddlePortal, PADDLE_PRICE_IDS, initPaddle } from '../utils/paddle';

const SUPABASE_FUNCTIONS_URL = process.env.REACT_APP_SUPABASE_URL
  ? `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`
  : 'https://eocagbloalvidegyxvpv.supabase.co/functions/v1';

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
  const [upgrading, setUpgrading] = useState(false);
  const [user, setUser] = useState(null);
  const userRef = useRef(null);

  // Load user + subscription on mount
  useEffect(() => {
    initPaddle();

    const load = async () => {
      // Use getSession() (reads localStorage, no network lock) instead of
      // getUser() (network call) to avoid NavigatorLockAcquireTimeoutError
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      userRef.current = u;
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
   * @param {boolean} skipTrial - true = use no-trial price ID, false = use trial price ID
   */
  const subscribe = useCallback(async (plan, cycle = 'monthly', skipTrial = false) => {
    if (!user) {
      console.warn('[useSubscription] User not logged in — redirect to auth first');
      return;
    }
    // Trial button  → monthlyTrial / yearlyTrial
    // Skip trial    → monthly / yearly
    const priceKey = skipTrial ? cycle : `${cycle}Trial`;
    const priceId = PADDLE_PRICE_IDS[plan]?.[priceKey];
    if (!priceId) {
      console.error('[useSubscription] Unknown plan/cycle/trial:', plan, cycle, skipTrial);
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
        writeCache(resolved, user.email);
      },
    });
  }, [user]);

  /**
   * Re-fetch subscription from Supabase and refresh cache.
   * Call this after operations that change the plan (e.g. upgrade).
   */
  const refetchSubscription = useCallback(async () => {
    const u = userRef.current;
    if (!u) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', u.id)
      .maybeSingle();
    const resolved = data ?? { plan: 'free', status: 'active' };
    setSubscription(resolved);
    writeCache(resolved, u.email);
  }, []);

  /**
   * Upgrade an existing Paddle subscription in-place (no new checkout).
   * Only for paid→paid upgrades, e.g. Pro → Business.
   * @param {'pro'|'business'} targetPlan
   * @param {'monthly'|'yearly'} [cycle] — defaults to user's current cycle
   */
  const upgradeSubscription = useCallback(async (targetPlan, cycle) => {
    const u = userRef.current;
    if (!u) {
      console.warn('[useSubscription] upgradeSubscription: no logged-in user');
      return { success: false, error: 'Not logged in' };
    }

    setUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('No access token');

      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/upgrade-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ targetPlan, cycle }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[useSubscription] upgradeSubscription failed:', data);
        return { success: false, error: data.error ?? 'Upgrade failed' };
      }

      // Refresh local state immediately — don't wait for webhook
      await refetchSubscription();
      return { success: true, plan: targetPlan };
    } catch (err) {
      console.error('[useSubscription] upgradeSubscription error:', err);
      return { success: false, error: String(err) };
    } finally {
      setUpgrading(false);
    }
  }, [refetchSubscription]);

  /** Open Paddle customer portal to manage / cancel */
  const manageSubscription = useCallback(() => {
    openPaddlePortal(subscription?.paddle_customer_id);
  }, [subscription]);

  return {
    subscription,
    loading,
    upgrading,
    user,
    isPaid,
    isPro,
    isBusiness,
    isTrialing,
    plan: isTesterBusiness ? 'business' : isTesterPro ? 'pro' : (subscription?.plan ?? 'free'),
    status: (isTesterPro || isTesterBusiness) ? 'active' : (subscription?.status ?? 'active'),
    subscribe,
    upgradeSubscription,
    refetchSubscription,
    manageSubscription,
  };
}
