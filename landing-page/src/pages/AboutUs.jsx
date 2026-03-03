import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Target, Heart, Zap, TrendingUp, Award, Sparkles, MapPin, Globe, Linkedin } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const stats = [
  { value: '100K+', label: 'User Capacity', icon: Users },
  { value: '$500M+', label: 'Volume Capacity', icon: TrendingUp },
  { value: '50+', label: 'Countries', icon: Globe },
  { value: '99.9%', label: 'Uptime', icon: Zap },
];

const values = [
  { icon: Heart, title: 'User-First', desc: 'Every decision starts with "How does this help our users?" We build features people need, not features that look good in demos.', color: 'pink' },
  { icon: Target, title: 'Radical Transparency', desc: 'No hidden fees, no data selling, no dark patterns. We tell you exactly what we do with your data and how we make money.', color: 'blue' },
  { icon: Zap, title: 'Speed Obsessed', desc: 'Performance is a feature. We optimize for milliseconds because your time is valuable — dashboards load in under 200ms.', color: 'amber' },
  { icon: Award, title: 'Security-First', desc: 'Bank-level encryption, 2FA, row-level security. Your financial data is protected with the same standards used by financial institutions.', color: 'emerald' },
];

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', bio: 'Ex-Goldman Sachs, 15 years in fintech', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Sarah Kim', role: 'CTO & Co-Founder', bio: 'Previously engineering lead at Stripe', gradient: 'from-purple-500 to-pink-500' },
  { name: 'James Webb', role: 'Head of Design', bio: 'Former design director at Square', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Maya Patel', role: 'Head of AI', bio: 'PhD Stanford, ex-Google DeepMind', gradient: 'from-emerald-500 to-teal-500' },
];

const bgMap = { pink: 'bg-pink-500/10 border-pink-500/20', blue: 'bg-blue-500/10 border-blue-500/20', amber: 'bg-amber-500/10 border-amber-500/20', emerald: 'bg-emerald-500/10 border-emerald-500/20' };
const txtMap = { pink: 'text-pink-400', blue: 'text-blue-400', amber: 'text-amber-400', emerald: 'text-emerald-400' };

const AboutUs = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-8 left-8 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span className="text-sm font-semibold">Back</span>
        </Link>
      </motion.div>

      {/* Hero */}
      <section className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:rotate-12 transition-transform duration-500">
              <Users className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Our Story
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            About<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">FinTrack</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We started FinTrack because we believed everyone deserves powerful financial tools — not just the wealthy.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 text-center hover:border-blue-500/30 transition-all"
            >
              <s.icon className="w-6 h-6 text-blue-400 mx-auto mb-3" />
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Our Values</motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-8 hover:border-white/15 transition-all"
                style={{ perspective: '1000px' }}
              >
                <motion.div whileHover={{ rotateY: 3, rotateX: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className={`w-12 h-12 ${bgMap[v.color]} border rounded-[14px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <v.icon className={`w-6 h-6 ${txtMap[v.color]}`} />
                  </div>
                  <h3 className="text-lg font-black mb-2">{v.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Leadership Team</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-6 text-center hover:border-white/15 transition-all"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${t.gradient} rounded-[20px] flex items-center justify-center mx-auto mb-4 text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform`}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-black text-white">{t.name}</h3>
                <p className="text-blue-400 text-xs font-bold mt-1">{t.role}</p>
                <p className="text-gray-500 text-xs mt-2">{t.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="pb-32 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[32px] p-12">
          <h2 className="text-3xl font-black mb-4">Our Mission</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">Democratize financial management with AI-powered tools that are accessible, secure, and beautifully designed for everyone.</p>
          <Link to="/" className="inline-flex px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-500/20">Back to Home</Link>
        </motion.div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default AboutUs;
