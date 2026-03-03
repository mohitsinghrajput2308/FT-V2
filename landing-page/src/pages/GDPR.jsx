import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { ShieldCheck, Database, UserCheck, Download, Trash2, Bell, Globe, Lock, Sparkles } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const rights = [
  { icon: UserCheck, title: 'Right to Access', desc: 'Request a complete copy of all personal data we hold about you. We\'ll provide it within 30 days in a machine-readable format.' },
  { icon: Database, title: 'Right to Rectification', desc: 'Correct any inaccurate personal data. Update your profile directly or contact us for data corrections.' },
  { icon: Trash2, title: 'Right to Erasure', desc: 'Request deletion of all your personal data. We\'ll remove everything within 30 days — "Right to be Forgotten".' },
  { icon: Download, title: 'Right to Portability', desc: 'Export all your data in standard formats (JSON, CSV). Take your financial history anywhere.' },
  { icon: Bell, title: 'Right to Object', desc: 'Object to processing of your data for specific purposes. You can opt-out of analytics and non-essential processing.' },
  { icon: Lock, title: 'Right to Restrict', desc: 'Request limitation of processing while disputes are resolved. Your data stays frozen but accessible.' },
];

const GDPR = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 left-20 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
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
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 hover:rotate-6 transition-transform duration-500">
              <Globe className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> EU Data Protection
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            GDPR<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Compliance</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            FinTrack is fully GDPR compliant. Here are your data rights and how we uphold them.
          </motion.p>
        </div>
      </section>

      {/* Rights Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rights.map((r, i) => (
            <motion.div key={r.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-7 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-indigo-500/5"
              style={{ perspective: '1000px' }}
            >
              <motion.div whileHover={{ rotateY: 5, rotateX: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-[14px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <r.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-base font-black text-white mb-2">{r.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Data Processing Card */}
      <section className="pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto bg-[#0A0A0B] border border-white/5 rounded-[32px] p-10">
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-black">Our GDPR Commitments</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
            {[
              'Data Protection Officer appointed and available at dpo@fintrack.app',
              'Privacy Impact Assessments conducted for all new features',
              'Data breach notification within 72 hours to authorities and affected users',
              'Lawful basis documented for every type of data processing',
              'Cross-border data transfers comply with EU Standard Contractual Clauses',
              'Regular third-party security audits and penetration testing',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="pb-32 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-indigo-500/20 rounded-[32px] p-12">
          <h2 className="text-3xl font-black mb-4">Exercise your rights</h2>
          <p className="text-gray-400 mb-6">Contact our DPO at <span className="text-indigo-400 font-semibold">dpo@fintrack.app</span></p>
          <Link to="/" className="inline-flex px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-indigo-500/20">Back to Home</Link>
        </motion.div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default GDPR;
