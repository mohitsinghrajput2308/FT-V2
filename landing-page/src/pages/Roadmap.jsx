import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Map, Sparkles, CheckCircle2, Circle, Clock, Rocket, Zap, Brain, Globe } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const phases = [
  {
    title: 'Phase 1 — Foundation (Launched)', status: 'complete', gradient: 'from-emerald-500 to-teal-500',
    items: [
      { text: 'User authentication & profiles', done: true },
      { text: 'Transaction tracking & categorization', done: true },
      { text: 'Budget creation & management', done: true },
      { text: 'Basic expense reports', done: true },
    ]
  },
  {
    title: 'Phase 2 — Core Functions (In Progress)', status: 'current', gradient: 'from-blue-500 to-indigo-500',
    items: [
      { text: 'Goals & savings tracking', done: true },
      { text: 'Bill reminders', done: true },
      { text: 'Investment portfolio overview', done: false },
      { text: 'Transaction search & filtering', done: false },
    ]
  },
  {
    title: 'Phase 3 — Enhancements (Planned)', status: 'upcoming', gradient: 'from-purple-500 to-violet-500',
    items: [
      { text: 'Recurring transaction detection', done: false },
      { text: 'Budget performance analytics', done: false },
      { text: 'Export data to CSV & PDF', done: false },
      { text: 'Mobile responsive improvements', done: false },
    ]
  },
  {
    title: 'Phase 4 — Future (Planned)', status: 'upcoming', gradient: 'from-amber-500 to-orange-500',
    items: [
      { text: 'Multi-currency support', done: false },
      { text: 'Shared family budgets', done: false },
      { text: 'Advanced reporting & forecasts', done: false },
      { text: 'Community features & feedback', done: false },
    ]
  },
];

const visionCards = [
  { icon: Rocket, title: 'Simple', desc: 'Easy-to-use budget and expense tracking', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Brain, title: 'Transparent', desc: 'Clear insights into your spending patterns', gradient: 'from-purple-500 to-pink-500' },
  { icon: Globe, title: 'Accessible', desc: 'Helping users better understand their finances', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'Secure', desc: 'Your financial data protected with encryption', gradient: 'from-amber-500 to-orange-500' },
];

const Roadmap = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0 pointer-events-none">
      <motion.div animate={{ y: [0, -25, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">

      <section className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-cyan-500/30 hover:rotate-12 transition-transform duration-500">
              <Map className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> What's Next
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Product<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Roadmap</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We're building FinTrack to help you track your money and understand your spending. Here's what we're working on.
          </motion.p>
        </div>
      </section>

      {/* Vision */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visionCards.map((v, i) => (
            <motion.div key={v.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-5 text-center hover:border-cyan-500/20 transition-all"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center`}>
                <v.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-white text-sm">{v.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {phases.map((phase, pi) => (
            <motion.div key={phase.title} custom={pi} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className={`bg-[#0A0A0B] border rounded-[24px] p-7 transition-all ${phase.status === 'current' ? 'border-cyan-500/30 ring-1 ring-cyan-500/20' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center flex-shrink-0`}>
                  {phase.status === 'complete' ? <CheckCircle2 className="w-5 h-5 text-white" /> : phase.status === 'current' ? <Clock className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-white" />}
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-white">{phase.title}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    phase.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                    phase.status === 'current' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-gray-500/10 text-gray-500'
                  }`}>
                    {phase.status === 'complete' ? 'Shipped' : phase.status === 'current' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
              </div>
              <div className="space-y-3 ml-[52px]">
                {phase.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-700 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-gray-500'}`}>{item.text}</span>
                  </div>
                ))}
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

export default Roadmap;
