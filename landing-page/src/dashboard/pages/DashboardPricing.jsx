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
    description: 'Perfect for tracking basic spending',
    color: 'text-gray-400',
    border: 'border-gray-200 dark:border-dark-400',
    features: [
      'Up to 50 transactions per month',
      'Investment tracking (3 max)',
      'Financial calculators (blocked)',
      '2 budgets, 2 goals & 2 bills',
      'Basic expense categories',
      'Simple transaction tracking',
      'Email support',
    ],
  },
  {
    key: 'pro',
    label: 'PRO',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    description: 'Best for serious personal finance tracking',
    color: 'text-amber-500',
    border: 'border-amber-400 dark:border-amber-500',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Everything in Free',
      'Up to 500 transactions per month',
      'Unlimited investment tracking',
      'All 7 financial calculators',
      '10 budgets, 10 goals & 10 bills',
      'Unlimited custom categories',
      'CSV & PDF data export',
      'Priority email support',
    ],
  },
  {
    key: 'business',
    label: 'BUSINESS',
    name: 'Business',
    price: { monthly: 29.99, yearly: 24.99 },
    description: 'For small teams managing finances together',
    color: 'text-blue-400',
    border: 'border-blue-400/40 dark:border-blue-500/40',
    features: [
      'Everything in Pro',
      'Unlimited transactions',
      'Unlimited investment tracking',
      'All 7 financial calculators',
      'Unlimited budgets, goals & bills',
      'Unlimited custom categories',
      'Multi-user access (up to 3 users)',
      'Dedicated support',
    ],
  },
];

const comparison = [
  {
    category: 'Core Tracking',
    rows: [
      { feature: 'Transactions per Month', free: '50', pro: '500', business: 'Unlimited' },
      { feature: 'Income & Expense Tracking', free: true, pro: true, business: true },
      { feature: 'Transaction Categories', free: 'Basic', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Recurring Transactions', free: true, pro: true, business: true },
      { feature: 'Investment Tracking', free: '3 max', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Financial Calculators', free: false, pro: 'All 7', business: 'All 7' },
    ],
  },
  {
    category: 'Budgets, Goals & Bills',
    rows: [
      { feature: 'Budgets', free: '2 max', pro: '10 max', business: 'Unlimited' },
      { feature: 'Savings Goals', free: '2 max', pro: '10 max', business: 'Unlimited' },
      { feature: 'Bill Reminders', free: '2 max', pro: '10 max', business: 'Unlimited' },
    ],
  },
  {
    category: 'Categories',
    rows: [
      { feature: 'Default Categories', free: true, pro: true, business: true },
      { feature: 'Custom Categories', free: false, pro: '3 lifetime', business: 'Unlimited' },
    ],
  },
  {
    category: 'Reports & Exports',
    rows: [
      { feature: 'Analytics Dashboard', free: true, pro: true, business: true },
      { feature: 'CSV Export', free: false, pro: true, business: true },
      { feature: 'PDF Export', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Collaboration',
    rows: [
      { feature: 'Team Members', free: '1', pro: '1', business: 'Up to 3' },
    ],
  },
  {
    category: 'Support',
    rows: [
      { feature: 'Email Support', free: true, pro: true, business: true },
      { feature: 'Priority Support', free: false, pro: true, business: true },
      { feature: 'Dedicated Support', free: false, pro: false, business: true },
    ],
  },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your account settings. Your access continues until the end of your current billing period. If you cancel during a 14-day trial, you\'re not charged.' },
  { q: 'Is there a free trial?', a: 'Yes! Pro and Business plans include a 7-day free trial with full access to all features. No credit card required to start the trial — you\'re only charged when the trial ends. Cancel anytime during the trial and you won\'t be charged.' },
  { q: 'What are your refund terms?', a: 'See our Terms of Service and Pricing page for complete refund policy details.' },
  { q: 'How does the yearly discount work?', a: 'Choosing yearly billing gives you 20% off the monthly rate. You pay the full year upfront at the discounted price, which results in significant savings. You can still cancel anytime.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Paddle. Paddle supports 100+ payment methods globally including local options. All transactions are encrypted with PCI-DSS compliance.' },
  { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade anytime from your account settings. Upgrades take effect immediately and you pay the difference. Downgrades apply at your next billing cycle, so you keep the current plan benefits through your current billing period.' },
  { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your transactions are stored securely in Supabase with Row Level Security — only you can access your data. We never sell or share your financial information.' },
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
      {/* Header */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
          <Star className="w-3.5 h-3.5" /> Plans & Pricing
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          Simple, transparent pricing. Start free, upgrade when you need more.
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
          const isCurrent = currentPlan === plan.key || (plan.key === 'free' && !isPro && !isBusiness);
          const price = yearly ? plan.price.yearly : plan.price.monthly;

          // Tier ranks: free=0, pro=1, business=2
          const tierRank = { free: 0, pro: 1, business: 2 };
          const userTier = isBusiness ? 2 : isPro ? 1 : 0;
          const planTier = tierRank[plan.key] ?? 0;
          const isLowerTier = planTier < userTier;
          const isHigherTier = planTier > userTier;

          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border-2 p-6 flex flex-col gap-5 bg-white dark:bg-dark-200 transition-shadow ${plan.border} ${plan.highlight && !isCurrent ? 'shadow-xl shadow-amber-500/10' : 'shadow-sm'} ${isLowerTier ? 'opacity-70' : ''}`}
            >
              {isCurrent && (
                <span className="absolute -top-3.5 left-4 text-[11px] font-black bg-primary-500 text-white px-3 py-0.5 rounded-full uppercase tracking-widest">
                  Current Plan
                </span>
              )}
              {plan.badge && !isCurrent && !isLowerTier && (
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
              ) : isLowerTier ? (
                <div className="text-xs text-center font-semibold py-2.5 border border-gray-200 dark:border-dark-400 rounded-xl text-gray-400 dark:text-gray-500">
                  {plan.key === 'free'
                    ? 'Included in your plan'
                    : `Included in your ${isBusiness ? 'Business' : 'Pro'} Plan`}
                </div>
              ) : plan.key === 'free' ? (
                <div className="text-xs text-center text-gray-400 py-2.5 border border-gray-200 dark:border-dark-400 rounded-xl">
                  Free forever
                </div>
              ) : isHigherTier ? (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${plan.key === 'pro'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-md shadow-amber-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white'
                    }`}
                >
                  {plan.key === 'pro' ? <Zap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  {plan.key === 'pro' ? 'Upgrade to Pro' : 'Get Business'}
                </button>
              ) : null}
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
