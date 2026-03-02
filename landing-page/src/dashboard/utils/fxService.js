/**
 * fxService.js — Live FX Rate Fetcher
 *
 * Uses the free ExchangeRate-API endpoint (no API key needed).
 * Rates are fetched once per hour and cached in localStorage.
 *
 * Supported base: USD (all other currencies are relative to 1 USD)
 * Free endpoint: https://open.exchangerate-api.com/v6/latest/USD
 */

const CACHE_KEY = 'fintrack_fx_rates';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Maps currency symbol used in settings to an ISO 4217 currency code */
export const SYMBOL_TO_CODE = {
  '$':   'USD',
  '€':   'EUR',
  '£':   'GBP',
  '₹':   'INR',
  '¥':   'JPY',
  'A$':  'AUD',
  'C$':  'CAD',
  'CHF': 'CHF',
};

/** Reverse: ISO code → display symbol */
export const CODE_TO_SYMBOL = Object.fromEntries(
  Object.entries(SYMBOL_TO_CODE).map(([sym, code]) => [code, sym])
);

/** All supported currencies for the Settings dropdown */
export const SUPPORTED_CURRENCIES = [
  { symbol: '$',   code: 'USD', label: '$ US Dollar (USD)' },
  { symbol: '€',   code: 'EUR', label: '€ Euro (EUR)' },
  { symbol: '£',   code: 'GBP', label: '£ British Pound (GBP)' },
  { symbol: '₹',   code: 'INR', label: '₹ Indian Rupee (INR)' },
  { symbol: '¥',   code: 'JPY', label: '¥ Japanese Yen (JPY)' },
  { symbol: 'A$',  code: 'AUD', label: 'A$ Australian Dollar (AUD)' },
  { symbol: 'C$',  code: 'CAD', label: 'C$ Canadian Dollar (CAD)' },
  { symbol: 'CHF', code: 'CHF', label: 'CHF Swiss Franc (CHF)' },
];

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rates, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null; // expired
    return rates;
  } catch {
    return null;
  }
}

function writeCache(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
  } catch { /* storage full — skip */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch live exchange rates (relative to USD).
 * Returns a map like: { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.1, ... }
 * Falls back to hardcoded rates if the network is unavailable.
 */
export async function fetchFxRates() {
  const cached = readCache();
  if (cached) return cached;

  try {
    const res = await fetch('https://open.exchangerate-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rates = json.rates ?? {};
    writeCache(rates);
    return rates;
  } catch (err) {
    console.warn('[fxService] Live rates unavailable, using fallback:', err.message);
    // Approximate static fallback (updated March 2026)
    return {
      USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.1,
      JPY: 150.2, AUD: 1.54, CAD: 1.36, CHF: 0.89,
    };
  }
}

/**
 * Convert an amount from one ISO currency code to another.
 * @param {number}  amount      - The value to convert
 * @param {string}  fromCode    - ISO source currency code, e.g. "USD"
 * @param {string}  toCode      - ISO target currency code, e.g. "EUR"
 * @param {object}  rates       - Rate map from fetchFxRates()
 * @returns {number}
 */
export function convertCurrency(amount, fromCode, toCode, rates) {
  if (!rates || fromCode === toCode) return amount;
  const fromRate = rates[fromCode] ?? 1;
  const toRate   = rates[toCode]   ?? 1;
  // Convert to USD first, then to target
  return (amount / fromRate) * toRate;
}
