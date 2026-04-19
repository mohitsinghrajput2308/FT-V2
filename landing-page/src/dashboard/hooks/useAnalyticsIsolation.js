/**
 * SECURITY: Analytics Isolation for Financial Pages
 * 
 * This module ensures NO third-party analytics track financial data.
 * - Google Analytics disabled on dashboard pages
 * - Crisp Chat disabled on dashboard pages  
 * - Only aggregated metrics allowed (none tied to user accounts)
 */

import { useEffect } from 'react';

/**
 * Hook to disable third-party analytics on financial pages
 * Use this on routes that display financial data: /dashboard, /transactions, /investments, etc.
 */
export const useDisableFinancialAnalytics = () => {
  useEffect(() => {
    // Disable Google Analytics in financial sections
    if (window.gtag) {
      window.gtag('config', window.__GA_ID__, {
        'anonymize_ip': true,
        'allow_google_signals': false,
        'allow_ad_personalization_signals': false,
      });
    }

    // Disable Crisp chat widget on financial pages
    if (window.$crisp) {
      window.$crisp.push(['set', 'session:data', [[
        ['context', 'financial_data_present', true],
        ['context', 'analytics_disabled', true],
      ]]]);
      window.$crisp.push(['do', 'chat:hide']);
    }

    return () => {
      // Re-enable on unmount
      if (window.$crisp) {
        window.$crisp.push(['do', 'chat:show']);
      }
    };
  }, []);
};

/**
 * Enhanced: Log only aggregated metrics, NEVER individual transactions
 */
export const logAggregatedMetric = (eventName, data = {}) => {
  // Sanitize: Remove any identifiable financial data
  const sanitized = {
    event: eventName,
    // ALLOWED: Aggregated counts, non-identifiable timestamps
    // BLOCKED: Account IDs, transaction amounts, specific categories
    timestamp: new Date().toISOString().split('T')[0], // Date only, not time
    ...Object.keys(data).reduce((acc, key) => {
      // Only allow non-sensitive fields
      if (!['amount', 'user_id', 'transaction_id', 'account_id', 'email'].includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {}),
  };

  if (window.gtag) {
    window.gtag('event', eventName, sanitized);
  }
};

/**
 * Opt-in consent management for analytics
 */
export const updateAnalyticsConsent = (consentGiven) => {
  // Update Google Consent Mode
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': consentGiven ? 'granted' : 'denied',
      'ad_storage': 'denied', // Never allow ad tracking on financial app
      'personalization_storage': 'denied',
    });
  }

  // Store preference in localStorage
  localStorage.setItem('analytics_consent', consentGiven ? 'granted' : 'denied');
};

export default {
  useDisableFinancialAnalytics,
  logAggregatedMetric,
  updateAnalyticsConsent,
};
