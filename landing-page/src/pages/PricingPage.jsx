import React, { useState } from 'react';
import { Check, X, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthModal } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { useSubscription } from '../hooks/useSubscription';

/* ─── Data ──────────────────────────────────────────────────── */
const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started with basic finance tracking',
    color: 'gray',
    cta: 'Start Free',
    ctaVariant: 'free',
    popular: false,
    trial: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    description: 'Best for individuals serious about their finances',
    color: 'gold',
    cta: 'Start 14-Day Trial',
    ctaVariant: 'gold',
    popular: true,
    trial: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 29.99,
    yearlyPrice: 24.99,
    description: 'Ideal for small businesses and teams',
    color: 'blue',
    cta: 'Start 14-Day Trial',
    ctaVariant: 'gold',
    popular: false,
    trial: true,
  },
];

/* ─── Feature categories & rows ────────────────────────────── */
const featureCategories = [
  {
    category: 'Core Tracking',
    features: [
      { name: 'Bank Accounts', free: '3 accounts', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Transaction History', free: '3 months', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Expense Categorization', free: 'Basic (10 categories)', pro: 'Advanced (50+)', business: 'Custom categories' },
      { name: 'Income Tracking', free: true, pro: true, business: true },
      { name: 'Multi-Currency Support', free: false, pro: true, business: true },
      { name: 'Recurring Transactions', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Budgets & Goals',
    features: [
      { name: 'Budget Envelopes', free: '3 budgets', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Savings Goals', free: '2 goals', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Bill Reminders', free: false, pro: true, business: true },
      { name: 'Spending Alerts', free: false, pro: true, business: true },
      { name: 'Shared Budgets (Teams)', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'Reports & Exports',
    features: [
      { name: 'Monthly Reports', free: true, pro: true, business: true },
      { name: 'Custom Date Range Reports', free: false, pro: true, business: true },
      { name: 'CSV Export', free: false, pro: true, business: true },
      { name: 'PDF Export', free: false, pro: true, business: true },
      { name: 'Tax Preparation Report', free: false, pro: false, business: true },
      { name: 'Advanced Analytics Dashboard', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'AI & Insights',
    features: [
      { name: 'AI-Powered Spending Insights', free: false, pro: true, business: true },
      { name: 'Smart Category Suggestions', free: false, pro: true, business: true },
      { name: 'Anomaly Detection', free: false, pro: true, business: true },
      { name: 'Financial Health Score', free: false, pro: true, business: true },
      { name: 'Forecast & Projections', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Team Members', free: '1 (just you)', pro: '1 (just you)', business: 'Up to 5 users' },
      { name: 'Business Expense Tracking', free: false, pro: false, business: true },
      { name: 'Dedicated Account Manager', free: false, pro: false, business: true },
      { name: 'Custom Integrations', free: false, pro: false, business: true },
      { name: 'API Access', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', free: true, pro: true, business: true },
      { name: 'Priority Support', free: false, pro: true, business: true },
      { name: 'Live Chat', free: false, pro: true, business: true },
      { name: 'Onboarding Assistance', free: false, pro: false, business: true },
      { name: 'SLA Guarantee', free: false, pro: false, business: true },
    ],
  },
];

/* ─── FAQ ───────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Can I change my plan later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades at the end of your billing cycle.',
  },
  {
    q: 'What happens when my free trial ends?',
    a: 'You will be notified before the trial ends. If you don\'t add a payment method, your account automatically reverts to the Free plan — no charge, no surprises.',
  },
  {
    q: 'Are payments secure?',
    a: 'All payments are processed securely through Stripe. FinTrack never stores your card details.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'You can cancel during the 14-day trial at no charge. After the trial all payments are final and non-refundable per our Terms of Service.',
  },
  {
    q: 'Can I use FinTrack on mobile?',
    a: 'FinTrack is fully responsive and works great on any device. A dedicated mobile app is on our roadmap.',
  },
  {
    q: 'Do you offer discounts for nonprofits or students?',
    a: 'Yes — reach out to us at support@fintrack.app with proof of eligibility and we\'ll apply a 50% discount.',
  },
];

/* ─── Helper components ─────────────────────────────────────── */
const FeatureCell = ({ value, planColor }) => {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${planColor === 'gold' ? 'bg-amber-500/20' : planColor === 'blue' ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
          <Check className={`w-3.5 h-3.5 ${planColor === 'gold' ? 'text-amber-400' : planColor === 'blue' ? 'text-blue-400' : 'text-gray-400'}`} />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <X className="w-4 h-4 text-gray-600" />
      </div>
    );
  return (
    <div className={`text-center text-xs font-medium ${planColor === 'gold' ? 'text-amber-300' : planColor === 'blue' ? 'text-blue-300' : 'text-gray-400'}`}>
      {value}
    </div>
  );
};

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left text-gray-200 font-medium hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────── */
const PricingPage = () => {
  const [yearly, setYearly] = useState(false);
  const { modalState, closeModal, openModal } = useAuthModal();
  const { subscribe, isPaid, plan: currentPlan, loading: subLoading } = useSubscription();

  const handlePlanClick = (planId, skipTrial = false) => {
    if (planId === 'free') {
      openModal?.('signup');
      return;
    }
    const cycle = yearly ? 'yearly' : 'monthly';
    subscribe(planId, cycle);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navbar />

      {/* ── Hero header ── */}
      <div className="pt-36 pb-16 text-center px-4 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/30 border border-blue-700/40 rounded-full mb-6">
          <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Pricing Plans</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
          Choose the Perfect Plan
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            For Your Journey
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Start free, upgrade when you need more. Paid plans include a 14-day free trial — cancel anytime during the trial at no charge.
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!yearly ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Yearly
            <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">20% OFF</span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="max-w-6xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-6 relative z-10">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isGold = plan.ctaVariant === 'gold';
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-[#0A0A0B] shadow-[0_0_60px_rgba(245,158,11,0.12)] scale-[1.02]'
                  : plan.color === 'blue'
                  ? 'border-blue-700/40 bg-gradient-to-b from-blue-950/30 to-[#0A0A0B]'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-end gap-1">
                <span className="text-5xl font-black">${price.toFixed(2)}</span>
                <span className="text-gray-500 mb-2">/month</span>
                {yearly && plan.monthlyPrice > 0 && (
                  <span className="ml-2 mb-2 line-through text-gray-600 text-sm">${plan.monthlyPrice.toFixed(2)}</span>
                )}
              </div>

              {/* Main CTA */}
              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full py-3 rounded-xl font-black text-sm mb-4 transition-all duration-300 hover:scale-[1.02] ${
                  plan.price === '0' || plan.monthlyPrice === 0
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20'
                }`}
              >
                {currentPlan === plan.id && isPaid ? 'Current Plan ✓' : plan.cta}
              </button>

              {/* Skip trial card */}
              {plan.trial && (
                <div onClick={() => handlePlanClick(plan.id, true)} className="relative group cursor-pointer mb-6">
                  <div className="absolute -inset-0.5 bg-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative flex items-center justify-between p-4 bg-[#17191E] border border-amber-700/40 rounded-2xl hover:border-amber-500/60 transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col text-left z-10">
                      <span className="text-[10px] font-black text-amber-500 tracking-[0.2em] mb-1 italic">FAST-TRACK SYNC</span>
                      <div className="text-sm font-black text-white leading-tight">SKIP TRIAL &amp; PAY<br />NOW</div>
                    </div>
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_36px_rgba(245,158,11,0.5)] transition-all z-10">
                      <Zap className="w-6 h-6 text-black fill-current" />
                    </div>
                  </div>
                </div>
              )}

              {/* Feature list */}
              <ul className="space-y-3 mt-auto">
                {plan.id === 'free' && [
                  'Track up to 3 accounts',
                  'Basic expense categorization',
                  'Monthly reports',
                  'Mobile app access',
                  'Email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.id === 'pro' && [
                  'Unlimited accounts',
                  'AI-powered insights',
                  'Custom budgets & goals',
                  'Bill reminders',
                  'Priority support & live chat',
                  'CSV & PDF export',
                  'Multi-currency support',
                  'Advanced analytics',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.id === 'business' && [
                  'Everything in Pro',
                  'Team collaboration (up to 5 users)',
                  'Business expense tracking',
                  'Tax preparation report',
                  'API access',
                  'Custom integrations',
                  'Dedicated account manager',
                  'Forecast & projections',
                  'Onboarding assistance',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Feature comparison table ── */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-2">Compare All Features</h2>
          <p className="text-gray-400">See exactly what's included in each plan</p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 bg-white/5 border-b border-white/10">
            <div className="p-5 font-semibold text-gray-400 text-sm">Feature</div>
            {plans.map(p => (
              <div key={p.id} className={`p-5 text-center font-black text-sm ${p.popular ? 'text-amber-400' : p.color === 'blue' ? 'text-blue-400' : 'text-gray-300'}`}>
                {p.name}
                <div className={`text-xs font-medium mt-0.5 ${p.popular ? 'text-amber-600' : 'text-gray-600'}`}>
                  ${yearly ? p.yearlyPrice.toFixed(2) : p.monthlyPrice.toFixed(2)}/mo
                </div>
              </div>
            ))}
          </div>

          {featureCategories.map((cat, ci) => (
            <div key={cat.category}>
              {/* Category header */}
              <div className="grid grid-cols-4 bg-white/[0.03] border-t border-white/10">
                <div className="px-5 py-3 col-span-4 text-xs font-black uppercase tracking-widest text-gray-500">{cat.category}</div>
              </div>
              {/* Feature rows */}
              {cat.features.map((feat, fi) => (
                <div
                  key={feat.name}
                  className={`grid grid-cols-4 border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors ${fi % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                >
                  <div className="px-5 py-3.5 text-sm text-gray-300">{feat.name}</div>
                  <FeatureCell value={feat.free} planColor="gray" />
                  <FeatureCell value={feat.pro} planColor="gold" />
                  <FeatureCell value={feat.business} planColor="blue" />
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-4 border-t border-white/10 bg-white/[0.02] p-5 gap-4">
            <div />
            <div>
              <button onClick={() => handlePlanClick('free')} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all">
                Start Free
              </button>
            </div>
            <div>
              <button onClick={() => handlePlanClick('pro')} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-sm font-black transition-all shadow-lg shadow-amber-500/20">
                Get Pro
              </button>
            </div>
            <div>
              <button onClick={() => handlePlanClick('business')} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-sm font-black transition-all shadow-lg shadow-amber-500/20">
                Get Business
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-3xl mx-auto px-4 pb-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about FinTrack pricing</p>
        </div>
        <div className="space-y-3">
          {faqs.map(f => <FAQItem key={f.q} {...f} />)}
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="border-t border-white/10 py-6 text-center text-gray-500 text-sm px-4">
        🔒 Secure payments powered by Paddle &nbsp;•&nbsp; Cancel during trial, no charge &nbsp;•&nbsp; All payments are non-refundable &nbsp;•&nbsp; No hidden fees &nbsp;•&nbsp; GST &amp; taxes handled automatically
      </div>

      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  );
};

export default PricingPage;
