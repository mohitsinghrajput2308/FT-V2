/**
 * Google Analytics 4 — Event Tracking Utility
 *
 * Usage:
 *   import { trackEvent, trackPageView } from '@/utils/analytics';
 *   trackEvent('signup_complete', { method: 'email' });
 *   trackEvent('transaction_added', { amount: 100, type: 'expense' });
 *
 * GA4 only loads when REACT_APP_GA_ID is set in .env.
 * In development (no GA_ID), all calls are safe no-ops.
 */

function gtag(...args) {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(args);
    }
}

/**
 * Track a custom event.
 * @param {string} eventName — GA4 event name (snake_case)
 * @param {object} params — Key-value pairs for event parameters
 */
export function trackEvent(eventName, params = {}) {
    gtag('event', eventName, params);
}

/**
 * Track a page view (called once per route change).
 * GA4 auto-tracks page views, but this gives explicit control.
 */
export function trackPageView(path, title) {
    gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
    });
}

// ── Pre-defined event helpers ──

/** User completed signup */
export const trackSignup = (method = 'email') =>
    trackEvent('sign_up', { method });

/** User logged in */
export const trackLogin = (method = 'email') =>
    trackEvent('login', { method });

/** Transaction added */
export const trackTransactionAdded = (type, category) =>
    trackEvent('transaction_added', { type, category });

/** Budget created */
export const trackBudgetCreated = (category) =>
    trackEvent('budget_created', { category });

/** Export clicked */
export const trackExport = (format, plan) =>
    trackEvent('export_clicked', { format, plan });

/** Pricing CTA clicked */
export const trackPricingCTA = (planName) =>
    trackEvent('pricing_cta_clicked', { plan: planName });

/** Newsletter subscribed */
export const trackNewsletterSubscribe = () =>
    trackEvent('newsletter_subscribe', { source: 'footer' });
