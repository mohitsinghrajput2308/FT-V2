// components/TrialCountdown.jsx
/**
 * TrialCountdown Component
 * 
 * Displays trial countdown banner if user is in trial period
 * Updates every minute
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const TrialCountdown = () => {
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTrialInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('trial_ends_at, status')
          .eq('user_id', user.id)
          .eq('status', 'trialing')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscription?.trial_ends_at) {
          const ends = new Date(subscription.trial_ends_at);
          const now = new Date();
          const diff = ends - now;
          
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          setTrialEndsAt(ends);
          setDaysRemaining(Math.max(0, days));
          setHoursRemaining(Math.max(0, hours));
        }
      } catch (error) {
        console.error('Error getting trial info:', error);
      } finally {
        setLoading(false);
      }
    }

    getTrialInfo();
    const interval = setInterval(getTrialInfo, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading || !trialEndsAt) {
    return null;
  }

  // Trial ended
  if (daysRemaining === 0 && hoursRemaining === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 7a1 1 0 00-2 0v6a1 1 0 102 0V7zm5-1a1 1 0 010 2H9a1 1 0 010-2h3zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-semibold text-red-800">Trial Ended</p>
            <p className="text-sm text-red-700 mt-1">
              Your trial has ended. Your subscription will automatically renew unless canceled.
            </p>
            <a 
              href="/billing"
              className="text-red-600 hover:text-red-800 underline text-sm mt-2 inline-block"
            >
              Manage Billing
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Trial expiring soon (3 days or less)
  if (daysRemaining <= 3) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-semibold text-orange-800">Trial Expiring Soon</p>
            <p className="text-sm text-orange-700 mt-1">
              {daysRemaining === 0 
                ? `Your trial ends in ${hoursRemaining} hours`
                : `Your trial expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
              }
              {' '}on {trialEndsAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular trial countdown
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="font-semibold text-blue-800">
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in your trial
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Your trial ends on {trialEndsAt.toLocaleDateString()}. 
            Payment will be automatically processed on the renewal date.
          </p>
        </div>
      </div>
    </div>
  );
};
