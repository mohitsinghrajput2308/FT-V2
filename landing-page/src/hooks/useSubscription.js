/**
 * useSubscription — React hook to read the current user's Paddle subscription
 * from Supabase and provide helpers to open checkout or the portal.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { openPaddleCheckout, openPaddlePortal, PADDLE_PRICE_IDS, initPaddle } from '../utils/paddle';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);  // null = loading
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Load user + subscription on mount
  useEffect(() => {
    initPaddle();

    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) { setLoading(false); return; }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle();

      setSubscription(data ?? { plan: 'free', status: 'active' });
      setLoading(false);
    };

    load();

    // Re-fetch when user auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => load());
    return () => authSub.unsubscribe();
  }, []);

  /** Is the user on a paid active plan? */
  const isPro = subscription?.plan === 'pro' && ['active', 'trialing'].includes(subscription?.status);
  const isBusiness = subscription?.plan === 'business' && ['active', 'trialing'].includes(subscription?.status);
  const isPaid = isPro || isBusiness;
  const isTrialing = subscription?.status === 'trialing';

  /**
   * Open Paddle checkout for a plan.
   * @param {'pro'|'business'} plan
   * @param {'monthly'|'yearly'} cycle
   */
  const subscribe = useCallback(async (plan, cycle = 'monthly') => {
    if (!user) {
      console.warn('[useSubscription] User not logged in');
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
        // Re-fetch subscription after checkout
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setSubscription(data);
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
    isPaid,
    isPro,
    isBusiness,
    isTrialing,
    plan: subscription?.plan ?? 'free',
    status: subscription?.status ?? 'active',
    subscribe,
    manageSubscription,
  };
}
