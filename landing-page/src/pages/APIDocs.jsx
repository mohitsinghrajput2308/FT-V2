import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Code2, Sparkles, Copy, Check, ChevronRight, Zap, Lock, Globe } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const endpoints = [
  { method: 'GET', path: '/api/v1/transactions', desc: 'List all transactions for the authenticated user', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { method: 'POST', path: '/api/v1/transactions', desc: 'Create a new transaction entry', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { method: 'GET', path: '/api/v1/budgets', desc: 'List all budgets with current progress', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { method: 'POST', path: '/api/v1/budgets', desc: 'Create a new budget category', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { method: 'GET', path: '/api/v1/analytics/summary', desc: 'Get spending summary and trends', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { method: 'PUT', path: '/api/v1/user/profile', desc: 'Update user profile settings', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { method: 'DELETE', path: '/api/v1/transactions/:id', desc: 'Delete a specific transaction', color: 'text-red-400', bg: 'bg-red-500/10' },
  { method: 'GET', path: '/api/v1/categories', desc: 'List all spending categories', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const codeExample = `// Fetch transactions
const response = await fetch(
  'https://api.fintrack.app/v1/transactions',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const { data } = await response.json();
console.log(data);
// [{ id: "tx_1", amount: -42.50, category: "Food", ... }]`;

const features = [
  { icon: Zap, title: 'Rate Limit', desc: '1,000 requests/min on free tier', gradient: 'from-amber-500 to-orange-500' },
  { icon: Lock, title: 'Auth', desc: 'Bearer token + optional API key', gradient: 'from-purple-500 to-indigo-500' },
  { icon: Globe, title: 'Base URL', desc: 'https://api.fintrack.app/v1', gradient: 'from-emerald-500 to-teal-500' },
];

const APIDocs = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(codeExample); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const { modalState, closeModal } = useAuthModal();
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-green-600/8 rounded-full blur-[120px]" />
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 right-1/3 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px]" />
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
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:rotate-12 transition-transform duration-500">
                <Code2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Developer Tools
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              API<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">Docs</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Build powerful integrations with the FinTrack REST API. Simple, secure, and well-documented.
            </motion.p>
          </div>
        </section>

        {/* API Features */}
        <section className="pb-12 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center flex-shrink-0`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-black mb-6">Quick Start</motion.h2>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className="p-5 text-sm font-mono text-gray-300 overflow-x-auto"><code>{codeExample}</code></pre>
            </motion.div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="pb-32 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl font-black mb-6">Endpoints</motion.h2>
            <div className="space-y-3">
              {endpoints.map((ep, i) => (
                <motion.div key={ep.path + ep.method} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="group bg-[#0A0A0B] border border-white/5 rounded-[16px] px-5 py-4 hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-4"
                >
                  <span className={`${ep.bg} ${ep.color} text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg flex-shrink-0`}>{ep.method}</span>
                  <code className="text-white font-mono text-sm flex-1 min-w-0 truncate">{ep.path}</code>
                  <span className="hidden sm:block text-gray-600 text-xs truncate max-w-[200px]">{ep.desc}</span>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  );
};

export default APIDocs;
