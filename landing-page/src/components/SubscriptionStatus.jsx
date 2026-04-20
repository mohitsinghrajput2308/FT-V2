// components/SubscriptionStatus.jsx
/**
 * SubscriptionStatus Component
 * 
 * Displays user's current subscription status and plan
 * Handles different subscription states (trialing, active, past_due, canceled)
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrialCountdown } from './TrialCountdown';

export const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: sub, error: err } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (err && err.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw err;
        }

        setSubscription(sub);
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading subscription info...</div>;
  }

  if (!subscription) {
    return (
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-700">No active subscription</p>
        <a 
          href="/pricing"
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          View Plans →
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Trial Countdown - shown if trialing */}
      {subscription.status === 'trialing' && <TrialCountdown />}

      {/* Past Due - payment failed */}
      {subscription.status === 'past_due' && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md mb-4">
          <h3 className="font-semibold text-red-800">Payment Failed</h3>
          <p className="text-sm text-red-700 mt-1">
            We couldn't process your payment. Please update your payment method.
          </p>
          <a 
            href="/billing/update-payment"
            className="text-red-600 hover:text-red-800 underline text-sm mt-2 inline-block"
          >
            Update Payment Method
          </a>
        </div>
      )}

      {/* Subscription Details */}
      <div className="p-4 bg-white rounded-md border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Plan */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Plan</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {subscription.plan}
            </p>
          </div>

          {/* Billing Cycle */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Billing Cycle</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {subscription.billing_cycle}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex h-2 w-2 rounded-full ${
                subscription.status === 'active' ? 'bg-green-500' :
                subscription.status === 'trialing' ? 'bg-blue-500' :
                subscription.status === 'past_due' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></span>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {subscription.status}
              </p>
            </div>
          </div>

          {/* Next Billing Date */}
          {subscription.next_billing_date && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Next Billing</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(subscription.next_billing_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {subscription.status !== 'canceled' && (
            <a 
              href="/billing"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
            >
              Manage Billing
            </a>
          )}
          
          {subscription.status === 'canceled' && (
            <a 
              href="/pricing"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Resubscribe
            </a>
          )}
        </div>
      </div>

      {/* Canceled notice */}
      {subscription.status === 'canceled' && (
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
          <p className="text-sm text-yellow-800">
            Your subscription was canceled on {new Date(subscription.canceled_at).toLocaleDateString()}
          </p>
          {subscription.cancellation_reason && (
            <p className="text-sm text-yellow-700 mt-1">
              Reason: {subscription.cancellation_reason}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <p className="text-sm text-red-800">Error loading subscription: {error}</p>
        </div>
      )}
    </>
  );
};
