import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, FileText, Globe, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };
const float = { animate: { y: [0, -15, 0], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } } };

const sections = [
  { icon: Eye, title: 'Data Collection', color: 'blue', items: ['We collect only essential account data (email, name, financial records you input)', 'No tracking cookies or third-party analytics on your financial data', 'Anonymous usage metrics to improve app performance — never tied to your identity', 'You choose what data to share — nothing is mandatory beyond email'] },
  { icon: Lock, title: 'Data Encryption', color: 'emerald', items: ['All data encrypted at rest using AES-256 military-grade encryption', 'TLS 1.3 for all data in transit — zero plain-text transmission', 'Database-level Row Level Security (RLS) on every table', 'Your password is hashed with bcrypt — we never store it in plain text'] },
  { icon: Server, title: 'Data Storage', color: 'purple', items: ['Hosted on Supabase infrastructure with SOC 2 Type II compliance', 'Data stored in isolated tenant environments', 'Automated backups every 24 hours with 30-day retention', 'You can export or delete all your data at any time'] },
  { icon: Globe, title: 'Third Parties', color: 'amber', items: ['We do NOT sell your data to any third party — ever', 'No advertising networks have access to your information', 'Only essential service providers (hosting, email delivery) access metadata', 'All third-party services are vetted and GDPR compliant'] },
  { icon: FileText, title: 'Your Rights', color: 'pink', items: ['Right to access all data we hold about you', 'Right to correct inaccurate information', 'Right to delete your account and all associated data', 'Right to data portability — export everything as JSON/CSV'] },
  { icon: Shield, title: 'Updates & Contact', color: 'cyan', items: ['We notify you via email of any policy changes 30 days in advance', 'This policy was last updated on February 2026', 'Questions? Contact privacy@fintrack.app', 'We respond to all privacy inquiries within 48 hours'] },
];

const colorMap = { blue: 'from-blue-500 to-blue-600', emerald: 'from-emerald-500 to-emerald-600', purple: 'from-purple-500 to-purple-600', amber: 'from-amber-500 to-amber-600', pink: 'from-pink-500 to-pink-600', cyan: 'from-cyan-500 to-cyan-600' };
const bgMap = { blue: 'bg-blue-500/10 border-blue-500/20', emerald: 'bg-emerald-500/10 border-emerald-500/20', purple: 'bg-purple-500/10 border-purple-500/20', amber: 'bg-amber-500/10 border-amber-500/20', pink: 'bg-pink-500/10 border-pink-500/20', cyan: 'bg-cyan-500/10 border-cyan-500/20' };
const textMap = { blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400', amber: 'text-amber-400', pink: 'text-pink-400', cyan: 'text-cyan-400' };

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
    {/* Animated background orbs */}
    <div className="fixed inset-0 z-0">
      <motion.div {...float} className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]" />
    </div>

    {/* Grid pattern overlay */}
    <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-8 left-8 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back</span>
        </Link>
      </motion.div>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/30 transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Your Data, Your Rules
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Privacy<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We believe your financial data is sacred. Here's exactly how we protect it — no corporate jargon, just straight facts.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-gray-600 text-sm mt-4">Last updated: February 2026</motion.p>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
          {sections.map((sec, i) => (
            <motion.div key={sec.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-8 hover:border-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
              style={{ perspective: '1000px' }}
            >
              <motion.div whileHover={{ rotateY: 5, rotateX: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className={`w-14 h-14 ${bgMap[sec.color]} border rounded-[16px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <sec.icon className={`w-7 h-7 ${textMap[sec.color]}`} />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight">{sec.title}</h3>
                <ul className="space-y-3">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colorMap[sec.color]} mt-2 shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-32 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[32px] p-12">
          <h2 className="text-3xl font-black mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">Contact our privacy team at <span className="text-blue-400 font-semibold">privacy@fintrack.app</span></p>
          <Link to="/" className="inline-flex px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
            Back to Home
          </Link>
        </motion.div>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;
