import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthModal } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Data ──────────────────────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started with personal finance tracking',
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
    description: 'For individuals who want full control of their finances',
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
      { name: 'Transactions (Income & Expenses)', free: '50', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Investments Tracking', free: '3 max', pro: 'Unlimited', business: 'Unlimited' },
      { name: 'Financial Calculators', free: false, pro: 'All 7', business: 'All 7' },
      { name: 'Income Tracking', free: true, pro: true, business: true },
      { name: 'Recurring Transactions', free: true, pro: true, business: true },
      { name: 'Analytics Dashboard', free: true, pro: true, business: true },
    ],
  },
  {
    category: 'Budgets, Goals & Bills',
    features: [
      { name: 'Budgets', free: '2 max', pro: '5 max', business: 'Unlimited' },
      { name: 'Savings Goals', free: '2 max', pro: '5 max', business: 'Unlimited' },
      { name: 'Bill Reminders', free: '2 max', pro: '5 max', business: 'Unlimited' },
    ],
  },
  {
    category: 'Categories',
    features: [
      { name: 'Default Categories', free: true, pro: true, business: true },
      { name: 'Custom Categories', free: false, pro: '3 lifetime', business: 'Unlimited' },
    ],
  },
  {
    category: 'Reports & Exports',
    features: [
      { name: 'Analytics & Reports', free: true, pro: true, business: true },
      { name: 'CSV Export', free: false, pro: true, business: true },
      { name: 'PDF Export', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Team Members', free: '1 (just you)', pro: '1 (just you)', business: 'Up to 5 users' },

    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', free: true, pro: true, business: true },
      { name: 'Priority Support', free: false, pro: true, business: true },
      { name: 'Live Chat', free: false, pro: true, business: true },
    ],
  },
];

/* ─── FAQ ───────────────────────────────────────────────────── */
const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time from your account settings. Your access continues until the end of your current billing period. If you cancel during a 14-day trial, you\'re not charged.' },
  { q: 'Is there a free trial?', a: 'Yes! Pro and Business plans include a 7-day free trial with full access to all features. No credit card required to start the trial — you\'re only charged when the trial ends. Cancel anytime during the trial and you won\'t be charged.' },
  { q: 'Do I get a money-back guarantee?', a: 'Absolutely. All paid plans include a 14-day money-back guarantee. If you\'re unhappy for any reason, contact us within 14 days of any charge and we\'ll issue a full refund, no questions asked.' },
  { q: 'How does the yearly discount work?', a: 'Choosing yearly billing gives you 20% off the monthly rate. You pay the full year upfront at the discounted price, which results in significant savings. You can still cancel anytime.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Paddle. Paddle supports 100+ payment methods globally including local options. All transactions are encrypted with PCI-DSS compliance.' },
  { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade anytime from your account settings. Upgrades take effect immediately and you pay the difference. Downgrades apply at your next billing cycle, so you keep the current plan benefits through your current billing period.' },
  { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your transactions are stored securely in Supabase with Row Level Security — only you can access your data. We never sell or share your financial information.' },
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

const FAQItem = ({ q, a, index, isOpen, onToggle }) => {
  return (
    <motion.div 
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="border border-white/10 rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left text-gray-200 font-medium hover:bg-white/5 transition-colors"
        onClick={() => onToggle(isOpen ? null : index)}
      >
        <span>{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </motion.div>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {isOpen && (
          <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-3">
            {a}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────── */
const PricingPage = () => {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { openRegister } = useAuthModal();

  const handlePlanClick = (planId) => {
    openRegister();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
          transition={{ duration: 8, repeat: Infinity }} 
          className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }} 
          transition={{ duration: 10, repeat: Infinity }} 
          className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" 
        />
      </div>
      
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10">
        {/* ── Hero header ── */}
        <div className="pt-36 pb-16 text-center px-4 relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/30 border border-blue-700/40 rounded-full mb-6"
          >
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Pricing Plans</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
          >
            Choose the Perfect Plan
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              For Your Journey
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Start free, upgrade when you need more. Paid plans include a 14-day free trial — cancel anytime during the trial at no charge.
          </motion.p>

          {/* Monthly / Yearly toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1 gap-1"
          >
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
          </motion.div>
        </div>

        {/* ── Plan cards ── */}
        <div className="max-w-6xl mx-auto px-4 pb-24 grid md:grid-cols-3 gap-6 relative z-10">
          {plans.map((plan, i) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isGold = plan.ctaVariant === 'gold';
            return (
              <motion.div
                key={plan.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-[#0A0A0B] shadow-[0_0_60px_rgba(245,158,11,0.12)] scale-[1.02]'
                    : plan.color === 'blue'
                    ? 'border-blue-700/40 bg-gradient-to-b from-blue-950/30 to-[#0A0A0B]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
                style={{ perspective: '1000px' }}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  </motion.div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 flex items-end gap-1"
                >
                  <span className="text-5xl font-black">${price.toFixed(2)}</span>
                  <span className="text-gray-500 mb-2">/month</span>
                  {yearly && plan.monthlyPrice > 0 && (
                    <span className="ml-2 mb-2 line-through text-gray-600 text-sm">${plan.monthlyPrice.toFixed(2)}</span>
                  )}
                </motion.div>

                {/* Main CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanClick(plan.id)}
                  className={`w-full py-3 rounded-xl font-black text-sm mb-4 transition-all duration-300 ${
                    plan.price === '0' || plan.monthlyPrice === 0
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                {/* Skip trial card */}
                {plan.trial && (
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handlePlanClick(plan.id, true)} 
                    className="relative group cursor-pointer mb-6"
                  >
                    <div className="absolute -inset-0.5 bg-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative flex items-center justify-between p-4 bg-[#17191E] border border-amber-700/40 rounded-2xl hover:border-amber-500/60 transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col text-left z-10">
                        <span className="text-[10px] font-black text-amber-500 tracking-[0.2em] mb-1 italic">FAST-TRACK SYNC</span>
                        <div className="text-sm font-black text-white leading-tight">SKIP TRIAL &amp; PAY<br />NOW</div>
                      </div>
                      <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_36px_rgba(245,158,11,0.5)] transition-all z-10"
                      >
                        <Zap className="w-6 h-6 text-black fill-current" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Feature list */}
                <ul className="space-y-3 mt-auto">
                  {plan.id === 'free' && [
                    '50 transactions (income & expenses)',
                    '3 investments max',
                    'Analytics dashboard & reports',
                    '2 budgets, 2 goals & 2 bill reminders',
                    'Default expense categories',
                    'Email support',
                  ].map((f, fi) => (
                    <motion.li 
                      key={f} 
                      custom={fi}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </motion.li>
                  ))}
                  {plan.id === 'pro' && [
                    'Everything in Free',
                    '5 budgets, 5 goals & 5 bill reminders',
                    '3 custom categories (lifetime)',
                    'CSV & PDF data export',
                    'Priority support & live chat',
                  ].map((f, fi) => (
                    <motion.li 
                      key={f} 
                      custom={fi}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </motion.li>
                  ))}
                  {plan.id === 'business' && [
                    'Everything in Pro',
                    'Unlimited budgets, goals & bills',
                    'Unlimited custom categories',
                    'Team collaboration (up to 5 users)',
                  ].map((f, fi) => (
                    <motion.li 
                      key={f} 
                      custom={fi}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: fi * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <Check className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* ── Feature comparison table ── */}
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black mb-2">Compare All Features</h2>
            <p className="text-gray-400">See exactly what's included in each plan</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 overflow-hidden"
          >
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
              <motion.div 
                key={cat.category}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.05 }}
              >
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
              </motion.div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-4 border-t border-white/10 bg-white/[0.02] p-5 gap-4">
              <div />
              <div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanClick('free')} 
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all"
                >
                  Start Free
                </motion.button>
              </div>
              <div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanClick('pro')} 
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-sm font-black transition-all shadow-lg shadow-amber-500/20"
                >
                  Get Pro
                </motion.button>
              </div>
              <div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanClick('business')} 
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-sm font-black transition-all shadow-lg shadow-amber-500/20"
                >
                  Get Business
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-3xl mx-auto px-4 pb-28">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-black mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about FinTrack pricing</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQItem key={f.q} index={i} isOpen={openFaq === i} onToggle={setOpenFaq} {...f} />)}
          </div>
        </div>

        {/* ── Trust bar ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 py-6 text-center text-gray-500 text-sm px-4"
        >
          🔒 Secure payments powered by Paddle &nbsp;•&nbsp; Cancel during trial, no charge &nbsp;•&nbsp; 14-day money-back guarantee &nbsp;•&nbsp; No hidden fees &nbsp;•&nbsp; GST &amp; taxes handled automatically
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
