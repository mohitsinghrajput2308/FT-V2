import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Tag, Bug, Zap, Star, ArrowUp, Gift } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const typeConfig = {
  feature: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'New Feature' },
  improvement: { icon: ArrowUp, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Improvement' },
  fix: { icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Bug Fix' },
  performance: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Performance' },
};

const releases = [
  {
    version: '2.4.0', date: 'January 20, 2025', title: 'AI Insights & Multi-Currency', gradient: 'from-purple-500 to-indigo-500',
    changes: [
      { type: 'feature', text: 'AI-powered spending insights with personalized recommendations' },
      { type: 'feature', text: 'Multi-currency support for 50+ currencies with real-time conversion' },
      { type: 'improvement', text: 'Redesigned dashboard with customizable widget layout' },
      { type: 'performance', text: 'Transaction loading speed improved by 3x' },
      { type: 'fix', text: 'Fixed budget reset not triggering on month boundaries' },
    ]
  },
  {
    version: '2.3.0', date: 'December 15, 2024', title: 'Two-Factor Authentication', gradient: 'from-emerald-500 to-teal-500',
    changes: [
      { type: 'feature', text: 'Optional TOTP-based two-factor authentication' },
      { type: 'feature', text: 'Security question recovery for password resets' },
      { type: 'improvement', text: 'Enhanced password strength meter with real-time feedback' },
      { type: 'fix', text: 'Fixed OTP verification timeout on slow connections' },
      { type: 'fix', text: 'Resolved duplicate notification issue on mobile' },
    ]
  },
  {
    version: '2.2.0', date: 'November 8, 2024', title: 'Smart Categories & Bank Sync', gradient: 'from-blue-500 to-cyan-500',
    changes: [
      { type: 'feature', text: 'Auto-categorization using ML-based transaction analysis' },
      { type: 'feature', text: 'Bank account synchronization via Plaid integration' },
      { type: 'improvement', text: 'Category management with custom icons and colors' },
      { type: 'performance', text: 'Reduced app bundle size by 40%' },
      { type: 'fix', text: 'Fixed chart rendering glitch on Safari browsers' },
    ]
  },
  {
    version: '2.1.0', date: 'October 1, 2024', title: 'Analytics Dashboard Overhaul', gradient: 'from-amber-500 to-orange-500',
    changes: [
      { type: 'feature', text: 'New analytics page with spending trends and patterns' },
      { type: 'improvement', text: 'Dark mode refinements across all screens' },
      { type: 'improvement', text: 'Improved accessibility (WCAG 2.1 AA compliance)' },
      { type: 'performance', text: 'API response times reduced by 60%' },
      { type: 'fix', text: 'Fixed data export including incorrect date ranges' },
    ]
  },
  {
    version: '2.0.0', date: 'August 15, 2024', title: 'FinTrack 2.0 — Complete Redesign', gradient: 'from-pink-500 to-rose-500',
    changes: [
      { type: 'feature', text: 'Completely redesigned UI with glassmorphism design system' },
      { type: 'feature', text: 'Real-time collaborative budgets for families' },
      { type: 'feature', text: 'Recurring transaction templates' },
      { type: 'improvement', text: 'New onboarding flow with interactive tutorial' },
      { type: 'performance', text: 'Offline-first architecture with instant sync' },
      { type: 'fix', text: 'Major stability improvements (99.9% uptime)' },
    ]
  },
];

const Changelog = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 right-1/3 w-[500px] h-[500px] bg-fuchsia-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-8 left-8 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span className="text-sm font-semibold">Back</span>
        </Link>
      </motion.div>

      <section className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-violet-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-fuchsia-500/30 hover:-rotate-12 transition-transform duration-500">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-fuchsia-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> What's New
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Change<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-violet-400 to-purple-400">Log</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Every update, improvement, and fix — all in one place.
          </motion.p>
        </div>
      </section>

      {/* Releases */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-fuchsia-500/50 via-violet-500/30 to-transparent hidden md:block" />

          {releases.map((release, ri) => (
            <motion.div key={release.version} custom={ri} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-8 md:pl-14 relative">
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 hidden md:block">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${release.gradient} flex items-center justify-center`}>
                  <Tag className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-white/5 rounded-[24px] p-7 hover:border-fuchsia-500/20 transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${release.gradient} font-black text-2xl`}>v{release.version}</span>
                  <span className="text-xs text-gray-600">{release.date}</span>
                </div>
                <h3 className="font-black text-white text-lg mb-4">{release.title}</h3>
                <div className="space-y-2.5">
                  {release.changes.map((change, ci) => {
                    const cfg = typeConfig[change.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={ci} className="flex items-start gap-3">
                        <span className={`${cfg.bg} ${cfg.color} text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 flex items-center gap-1`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className="text-gray-400 text-sm">{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default Changelog;
