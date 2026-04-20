/**
 * paddle.js — Paddle Billing (Paddle.js v2) integration utility
 *
 * Setup:
 * 1. Add to your public/index.html <head>:
 *    <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
 *
 * 2. Set REACT_APP_PADDLE_CLIENT_TOKEN in your .env
 *    (Live token starts with: live_  — Sandbox token starts with: test_)
 */

// ── Price IDs ─────────────────────────────────────────────────────────────────
// ⚠️  The IDs below marked with (needs pri_) are currently Product IDs (pro_xxx).
//     Replace each with the actual Price ID (pri_xxx) found inside that product
//     in Paddle Dashboard → Catalog → Products → [product] → Prices tab.
export const PADDLE_PRICE_IDS = {
  pro: {
    // LIVE IDs (verified account)
    monthlyTrial: 'pri_01kpjef8c48hr2hb60fmtgn1yx',
    yearlyTrial:  'pri_01kpjerzv1sxndswe1xy8x3t3c',
    monthly:      'pri_01kpjeaqgj2jee2kdyhvpwb1dt',
    yearly:       'pri_01kpjen114xwk6rv87t0mrse8j',
  },
  business: {
    // LIVE IDs (verified account)
    monthlyTrial: 'pri_01kpjfakbv47fhyqa899704nhg',
    yearlyTrial:  'pri_01kpjfmzrd0ae227q77qqja3jv',
    monthly:      'pri_01kpjf646mpzsfy5g9j9079rwe',
    yearly:       'pri_01kpjffwt20daa9ra66myxxed8',
  },
};

let paddleInitialized = false;
// Module-level success callback — set before each Checkout.open() call
let _onCheckoutSuccess = null;

/**
 * Initialize Paddle.js — call once on app start or before first checkout.
 * Uses sandbox if REACT_APP_PADDLE_SANDBOX=true
 */
export function initPaddle() {
  if (paddleInitialized || typeof window === 'undefined') return paddleInitialized;
  if (!window.Paddle) {
    console.error('[Paddle] Paddle.js not loaded. Add the CDN script to index.html');
    return false;
  }

  const isSandbox = process.env.REACT_APP_PADDLE_SANDBOX === 'true';
  const token = process.env.REACT_APP_PADDLE_CLIENT_TOKEN;

  if (!token) {
    console.error('[Paddle] Missing REACT_APP_PADDLE_CLIENT_TOKEN in .env');
    return false;
  }

  if (isSandbox) {
    window.Paddle.Environment.set('sandbox');
  }

  // eventCallback MUST live in Initialize(), not in Checkout.open()
  window.Paddle.Initialize({
    token,
    eventCallback(event) {
      console.log('[Paddle] Event:', event.name, event.data);
      if (event.name === 'checkout.completed' && typeof _onCheckoutSuccess === 'function') {
        _onCheckoutSuccess(event.data);
        _onCheckoutSuccess = null;
      }
    },
  });

  paddleInitialized = true;
  return true;
}

/**
 * Open Paddle overlay checkout for a given price.
 *
 * @param {string}   priceId    - Paddle price ID (pri_xxx)
 * @param {string}   userId     - Supabase user ID (passed via custom_data to webhook)
 * @param {string}   email      - Pre-fill the user's email
 * @param {function} onSuccess  - Called after successful payment
 */
export function openPaddleCheckout({ priceId, userId, email, onSuccess }) {
  if (typeof window === 'undefined' || !window.Paddle) {
    alert('Payment system is loading. Please refresh the page and try again.');
    return;
  }

  // Retry initialization in case it was skipped on mount
  const ready = initPaddle();
  if (!ready) {
    alert('Payment system not ready. Please restart the dev server to load the Paddle configuration, then try again.');
    return;
  }

  try {
    // Store the success callback so the Initialize() eventCallback can fire it
    _onCheckoutSuccess = onSuccess ?? null;

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email },
      customData: {
        user_id: userId,
        email,
      },
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'en',
        successUrl: `${window.location.origin}/dashboard?subscribed=true`,
      },
    });
  } catch (err) {
    console.error('[Paddle] Checkout.open() failed:', err);
  }
}

/**
 * Open Paddle customer portal to manage / cancel subscription.
 */
export function openPaddlePortal(customerId) {
  if (!customerId) {
    console.error('[Paddle] No customer ID provided');
    return;
  }
  window.open(`https://customer.paddle.com/subscription/${customerId}`, '_blank');
}
