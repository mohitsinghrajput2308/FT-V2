import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Building2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { initPaddle } from '../../utils/paddle';
import Card from '../components/Common/Card';

const plans = [
  {
    key: 'free',
    label: 'FREE',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Great for getting started',
    color: 'text-gray-400',
    border: 'border-gray-200 dark:border-dark-400',
    features: [
      'Track up to 3 accounts',
      'Basic expense categorization',
      'Monthly reports',
      'Email support',
    ],
  },
  {
    key: 'pro',
    label: 'PRO',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    description: 'For individuals serious about finances',
    color: 'text-amber-500',
    border: 'border-amber-400 dark:border-amber-500',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Unlimited accounts',
      'AI-powered insights',
      'CSV & PDF export',
      'Custom budgets & goals',
      'Priority support & live chat',
      'Multi-currency support',
    ],
  },
  {
    key: 'business',
    label: 'BUSINESS',
    name: 'Business',
    price: { monthly: 29.99, yearly: 24.99 },
    description: 'Ideal for small businesses & teams',
    color: 'text-blue-400',
    border: 'border-blue-400/40 dark:border-blue-500/40',
    features: [
      'Everything in Pro',
      'Team collaboration (5 users)',
      'Tax preparation report',
      'API access & custom integrations',
      'Dedicated account manager',
    ],
  },
];

const comparison = [
  {
    category: 'Core Tracking',
    rows: [
      { feature: 'Accounts', free: 'Up to 3', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Transactions', free: '500/mo', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Categories', free: 'Default only', pro: 'Custom', business: 'Custom' },
    ],
  },
  {
    category: 'Budgets & Goals',
    rows: [
      { feature: 'Budgets', free: '3 max', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Goals', free: '3 max', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Shared Budgets', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Reports & Exports',
    rows: [
      { feature: 'Monthly Reports', free: true, pro: true, business: true },
      { feature: 'CSV Export', free: false, pro: true, business: true },
      { feature: 'PDF Export', free: false, pro: true, business: true },
      { feature: 'Tax Reports', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'AI & Insights',
    rows: [
      { feature: 'AI Insights', free: false, pro: true, business: true },
      { feature: 'Spending Predictions', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Collaboration',
    rows: [
      { feature: 'Team Members', free: '1', pro: '1', business: 'Up to 5' },
      { feature: 'API Access', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { feature: 'Email Support', free: true, pro: true, business: true },
      { feature: 'Priority Support', free: false, pro: true, business: true },
      { feature: 'Live Chat', free: false, pro: true, business: true },
      { feature: 'Dedicated Manager', free: false, pro: false, business: true },
    ],
  },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your account settings. You keep Pro access until the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'The Free plan is yours forever with no credit card required. You can upgrade to Pro or Business whenever you\'re ready.' },
  { q: 'How does the yearly discount work?', a: 'Choosing yearly billing gives you 20% off — you pay upfront for 12 months at the discounted rate.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. All transactions are encrypted.' },
  { q: 'Can I switch plans later?', a: 'Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades apply at next billing cycle.' },
  { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell your financial data.' },
];

const Cell = ({ value }) => {
  if (value === true) return <Check className="w-4 h-4 text-success-500 mx-auto" />;
  if (value === false) return <span className="block w-4 h-0.5 bg-gray-300 dark:bg-dark-400 mx-auto rounded" />;
  return <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>;
};

const DashboardPricing = () => {
  const { currentUser } = useAuth();
  const { subscribe, isPro: isProSub, isBusiness: isBusinessSub, plan: currentPlan } = useSubscription();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [paddleReady, setPaddleReady] = useState(false);

  const isPro = isProSub;
  const isBusiness = isBusinessSub;

  useEffect(() => {
    // Try to initialize Paddle; retry up to 5 times waiting for paddle.js to load
    let attempts = 0;
    const tryInit = () => {
      const ok = initPaddle();
      if (ok) { setPaddleReady(true); return; }
      attempts++;
      if (attempts < 5) setTimeout(tryInit, 800);
    };
    tryInit();
  }, []);

  const handleUpgrade = (planKey) => {
    if (!paddleReady) {
      alert('Payment system is not ready.\n\nIf you are running locally, please restart your dev server (Ctrl+C → npm start) to load the Paddle configuration from .env.\n\nIf you are on the live site, please refresh the page.');
      return;
    }
    const cycle = yearly ? 'yearly' : 'monthly';
    subscribe(planKey, cycle);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 pb-16 space-y-10">
      {/* Paddle not ready warning */}
      {!paddleReady && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Payment system loading…</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              If buttons don't respond, <strong>restart the dev server</strong> (Ctrl+C → npm start) so the Paddle token is loaded from .env. On the live site, refresh the page.
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
          <Star className="w-3.5 h-3.5" /> Plans & Pricing
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Start free. Upgrade when you're ready.
          {isPro && <span className="ml-2 text-amber-500 font-semibold">You're on Pro ⭐</span>}
          {isBusiness && <span className="ml-2 text-blue-500 font-semibold">You're on Business 🏢</span>}
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-100 dark:bg-dark-300 rounded-full px-2 py-1.5">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!yearly ? 'bg-white dark:bg-dark-100 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${yearly ? 'bg-white dark:bg-dark-100 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Yearly
            <span className="text-[10px] font-black bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 px-1.5 py-0.5 rounded-full">-20%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.key === 'free' ? currentPlan === 'free' : currentPlan === plan.key;
          const price = yearly ? plan.price.yearly : plan.price.monthly;

          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border-2 p-6 flex flex-col gap-5 bg-white dark:bg-dark-200 transition-shadow ${plan.border} ${plan.highlight ? 'shadow-xl shadow-amber-500/10' : 'shadow-sm'}`}
            >
              {isCurrent && (
                <span className="absolute -top-3.5 left-4 text-[11px] font-black bg-primary-500 text-white px-3 py-0.5 rounded-full uppercase tracking-widest">
                  Current Plan
                </span>
              )}
              {plan.badge && !isCurrent && (
                <span className="absolute -top-3.5 right-4 text-[11px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div>
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${plan.color}`}>{plan.label}</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  {price === 0 ? '$0' : `$${price}`}
                  <span className="text-base font-normal text-gray-400">/mo</span>
                </p>
                {yearly && price > 0 && (
                  <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">Billed ${(price * 12).toFixed(0)}/year</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.key === 'pro' ? 'text-amber-500' : plan.key === 'business' ? 'text-blue-400' : 'text-gray-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-xs text-center font-semibold py-2.5 border border-gray-200 dark:border-dark-400 rounded-xl text-gray-400">
                  ✓ Your Current Plan
                </div>
              ) : plan.key === 'free' ? (
                <div className="text-xs text-center text-gray-400 py-2.5 border border-gray-200 dark:border-dark-400 rounded-xl">
                  Free forever
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${
                    plan.key === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-md shadow-amber-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                  }`}
                >
                  {plan.key === 'pro' ? <Zap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  {plan.key === 'pro' ? 'Upgrade to Pro' : 'Get Business'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Full Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-400">
                <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 w-1/2">Feature</th>
                <th className="text-center pb-3 font-black text-gray-600 dark:text-gray-300">Free</th>
                <th className="text-center pb-3 font-black text-amber-500">Pro</th>
                <th className="text-center pb-3 font-black text-blue-400">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(({ category, rows }) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan={4} className="pt-5 pb-2">
                      <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{category}</span>
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 dark:border-dark-400/50 hover:bg-gray-50 dark:hover:bg-dark-300/30">
                      <td className="py-2.5 text-gray-700 dark:text-gray-300">{row.feature}</td>
                      <td className="py-2.5 text-center"><Cell value={row.free} /></td>
                      <td className="py-2.5 text-center"><Cell value={row.pro} /></td>
                      <td className="py-2.5 text-center"><Cell value={row.business} /></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-dark-400 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-300/40 transition-colors"
              >
                {faq.q}
                {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-gray-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-dark-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPricing;
