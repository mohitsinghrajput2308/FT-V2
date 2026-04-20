// components/FeatureGate.jsx
/**
 * FeatureGate Component
 * 
 * Controls feature access based on user's subscription plan
 * Shows children if user has access to the feature, fallback otherwise
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const FeatureGate = ({ feature, children, fallback = null }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAccess(false);
          setUserPlan('free');
          setLoading(false);
          return;
        }

        // Get user's current plan from subscriptions table
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const plan = subscription?.plan || 'free';
        setUserPlan(plan);

        // Get features available for this plan
        const { data: planFeatures } = await supabase
          .from('plan_features')
          .select('features')
          .eq('plan', plan)
          .single();

        // Check if feature is enabled for this plan
        const access = planFeatures?.features?.[feature] === true;
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [feature]);

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (!hasAccess) {
    return fallback || (
      <FeatureLockedPrompt 
        feature={feature} 
        currentPlan={userPlan}
      />
    );
  }

  return children;
};

/**
 * Default fallback component when feature is locked
 */
const FeatureLockedPrompt = ({ feature, currentPlan }) => {
  return (
    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
      <h3 className="font-semibold text-yellow-800">Feature Locked</h3>
      <p className="text-sm text-yellow-700 mt-1">
        {feature === 'csv_export' && 'CSV export is available on Pro and Business plans'}
        {feature === 'api_access' && 'API access is available on Pro and Business plans'}
        {feature === 'priority_support' && 'Priority support is available on Pro and Business plans'}
      </p>
      <button
        onClick={() => window.location.href = '/pricing'}
        className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
      >
        Upgrade Plan
      </button>
    </div>
  );
};
