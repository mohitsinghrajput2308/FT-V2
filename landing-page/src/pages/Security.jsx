import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Lock, Eye, Server, Key, FileCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const practices = [
  { icon: Lock, title: 'Encryption', desc: 'AES-256 encryption at rest, TLS 1.3 for data in transit. Your financial data is always protected with military-grade encryption.', gradient: 'from-red-500 to-rose-500' },
  { icon: Eye, title: 'Zero-Knowledge Architecture', desc: 'We process data without viewing it. Even our engineers cannot access your personal financial information.', gradient: 'from-orange-500 to-amber-500' },
  { icon: Server, title: 'Infrastructure Security', desc: 'Hosted on SOC 2 Type II certified infrastructure. Automated security patching and 24/7 monitoring for intrusions.', gradient: 'from-blue-500 to-indigo-500' },
  { icon: Key, title: 'Multi-Factor Auth (2FA)', desc: 'Optional TOTP-based two-factor authentication adds an extra layer of protection to every account.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: FileCheck, title: 'Row-Level Security (RLS)', desc: 'Database policies ensure users can only access their own data. No exceptions, no backdoors.', gradient: 'from-purple-500 to-violet-500' },
  { icon: AlertTriangle, title: 'Rate Limiting & Abuse Protection', desc: 'Intelligent rate limiting prevents brute force attacks, credential stuffing, and API abuse.', gradient: 'from-pink-500 to-rose-500' },
];

const certifications = [
  { title: 'SOC 2 Type II', status: 'Certified', desc: 'Annual audit of security, availability & confidentiality controls' },
  { title: 'GDPR Compliant', status: 'Compliant', desc: 'Full compliance with EU General Data Protection Regulation' },
  { title: 'ISO 27001', status: 'In Progress', desc: 'Information security management system certification' },
  { title: 'PCI DSS Level 1', status: 'Certified', desc: 'Payment Card Industry data security standard' },
];

const timeline = [
  { date: 'Q4 2024', event: 'SOC 2 Type II audit completed' },
  { date: 'Q3 2024', event: 'Bug bounty program launched' },
  { date: 'Q2 2024', event: 'TOTP 2FA rolled out to all users' },
  { date: 'Q1 2024', event: 'Row-level security implemented' },
  { date: 'Q4 2023', event: 'End-to-end encryption deployed' },
];

const Security = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-rose-600/8 rounded-full blur-[100px]" />
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
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-red-500/30 hover:-rotate-12 transition-transform duration-500">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Trust & Safety
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Security<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-pink-400">First</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Your financial data deserves the highest level of protection. Here's how we keep it safe.
          </motion.p>
        </div>
      </section>

      {/* Security Practices */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {practices.map((p, i) => (
            <motion.div key={p.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-white mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Certifications & Compliance</motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.map((c, i) => (
              <motion.div key={c.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-5 flex items-start gap-4"
              >
                <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${c.status === 'In Progress' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white">{c.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{c.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Timeline */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Security Timeline</motion.h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-rose-500/30 to-transparent" />
            {timeline.map((t, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex gap-5 mb-6">
                <div className="w-12 flex-shrink-0 flex justify-center relative">
                  <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20 mt-1.5" />
                </div>
                <div className="pb-6">
                  <div className="text-xs text-red-400 font-bold mb-1">{t.date}</div>
                  <p className="text-gray-300 text-sm">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-[28px] p-10 text-center"
          >
            <h3 className="text-2xl font-black mb-3">Found a Vulnerability?</h3>
            <p className="text-gray-400 mb-6">We run a responsible disclosure program. Report security issues and earn bounties.</p>
            <a href="mailto:security@fintrack.app" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold px-8 py-3 rounded-full hover:shadow-xl hover:shadow-red-500/30 transition-all">
              <Shield className="w-4 h-4" /> Report a Vulnerability
            </a>
          </motion.div>
        </div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default Security;
