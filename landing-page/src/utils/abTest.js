/**
 * abTest.js — Lightweight A/B Testing Utility
 *
 * Assigns users to a variant (A or B) once per experiment and persists
 * the assignment in localStorage so the same user always sees the same variant.
 * Events are forwarded to GA4 via window.gtag() if available.
 *
 * Usage:
 *   import { getVariant, trackAbEvent } from '@/utils/abTest';
 *
 *   const variant = getVariant('cta_button_text'); // 'A' | 'B'
 *   trackAbEvent('cta_button_text', variant, 'click');
 */

const STORAGE_KEY = 'fintrack_ab_variants';

/**
 * Get (or assign) the variant for a given experiment name.
 * Assignment is random 50/50 and stored in localStorage.
 *
 * @param {string} experimentName - Unique identifier for the experiment
 * @returns {'A' | 'B'}
 */
export function getVariant(experimentName) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (stored[experimentName]) return stored[experimentName];

    const variant = Math.random() < 0.5 ? 'A' : 'B';
    stored[experimentName] = variant;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return variant;
  } catch {
    return 'A'; // safe fallback
  }
}

/**
 * Track an A/B experiment event in GA4.
 *
 * @param {string} experimentName - Experiment identifier
 * @param {'A'|'B'} variant       - The variant the user saw
 * @param {string} action         - e.g. 'impression', 'click', 'conversion'
 * @param {object} [extra]        - Additional GA4 params
 */
export function trackAbEvent(experimentName, variant, action, extra = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'ab_test', {
        experiment_name: experimentName,
        variant,
        action,
        ...extra,
      });
    }
  } catch { /* silent — never break UI */ }
}

/**
 * Helper: get the correct copy for an experiment.
 *
 * @param {string} experimentName
 * @param {{ A: string, B: string }} copies
 * @returns {string}
 */
export function getAbCopy(experimentName, copies) {
  const variant = getVariant(experimentName);
  return copies[variant] ?? copies.A;
}

// ── Pre-defined experiments ───────────────────────────────────────────────────

/**
 * Experiment registry — centralises all running experiments.
 * Add new ones here so they're visible in one place.
 */
export const EXPERIMENTS = {
  /** CTA section primary button text */
  CTA_BUTTON:    'cta_button_text',
  /** Hero section badge copy */
  HERO_BADGE:    'hero_badge_copy',
  /** Pricing section — Pro plan headline */
  PRICING_PRO:   'pricing_pro_headline',
};
