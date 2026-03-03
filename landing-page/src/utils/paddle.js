/**
 * paddle.js — Paddle Billing (Paddle.js v2) integration utility
 *
 * Setup:
 * 1. Add to your public/index.html <head>:
 *    <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
 *
 * 2. Set REACT_APP_PADDLE_CLIENT_TOKEN in your .env
 *    (Sandbox token starts with: test_  — Live token starts with: live_)
 *
 * 3. Replace the PRICE_IDS values below with your actual Paddle Price IDs
 */

// ── Price IDs (replace with your actual Paddle Price IDs) ────────
export const PADDLE_PRICE_IDS = {
  pro: {
    monthly: 'pri_01kjtc14vr6gnjtwhej3n712x0',
    yearly:  'pri_01kjtc41pf8cxdsh58kdddwj1s',
  },
  business: {
    monthly: 'pri_01kjtc6pwd86m38sbpjxfp7aw3',
    yearly:  'pri_01kjtc80nwm0nh70cbc755nbdq',
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
 * @param {string} priceId  - Paddle price ID (e.g. 'pri_xxxxxxxx')
 * @param {string} userId   - Your Supabase user ID (passed to webhook via custom_data)
 * @param {string} email    - Pre-fill the user's email
 * @param {function} onSuccess - Called after successful payment
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
 * Requires a Paddle customer portal URL from your dashboard.
 */
export function openPaddlePortal(customerId) {
  // This opens the Paddle customer portal in a new tab.
  // You can also use the Paddle API to generate a one-time portal URL.
  if (!customerId) {
    console.error('[Paddle] No customer ID provided');
    return;
  }
  window.open(`https://customer.paddle.com/subscription/${customerId}`, '_blank');
}
