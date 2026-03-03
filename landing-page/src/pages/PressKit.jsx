import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Newspaper, Download, Sparkles, Image, Palette, FileText, Video } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const assets = [
  { icon: Image, title: 'Logo Package', desc: 'SVG, PNG, and vector formats in all variants', format: '.zip — 4.2 MB', gradient: 'from-orange-500 to-red-500' },
  { icon: Palette, title: 'Brand Guidelines', desc: 'Typography, color palette, usage rules & spacing', format: '.pdf — 12 MB', gradient: 'from-amber-500 to-orange-500' },
  { icon: FileText, title: 'Fact Sheet', desc: 'Company overview, stats, and key milestones', format: '.pdf — 1.8 MB', gradient: 'from-yellow-500 to-amber-500' },
  { icon: Video, title: 'Product Screenshots', desc: 'High-res screens of dashboard, analytics & mobile', format: '.zip — 28 MB', gradient: 'from-rose-500 to-pink-500' },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '500K+', label: 'User Capacity' },
  { value: '$2.5B+', label: 'Volume Capacity' },
  { value: '50+', label: 'Countries Supported' },
];

const PressKit = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -25, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-orange-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[100px]" />
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
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-orange-500/30 hover:rotate-12 transition-transform duration-500">
              <Newspaper className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Media Resources
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Press<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">Kit</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Everything media, journalists, and partners need to tell the FinTrack story.
          </motion.p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 text-center"
            >
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Downloadable Assets */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Brand Assets</motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {assets.map((a, i) => (
              <motion.div key={a.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-orange-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center`}>
                    <a.icon className="w-6 h-6 text-white" />
                  </div>
                  <Download className="w-5 h-5 text-gray-600 group-hover:text-orange-400 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-black text-white mb-1">{a.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{a.desc}</p>
                <span className="text-xs text-gray-600 font-mono">{a.format}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Colors */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Brand Colors</motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[{ color: '#7C3AED', name: 'Primary Purple' }, { color: '#3B82F6', name: 'Electric Blue' }, { color: '#10B981', name: 'Success Green' }, { color: '#F59E0B', name: 'Accent Amber' }, { color: '#0A0A0B', name: 'Dark Base' }].map((c, i) => (
              <motion.div key={c.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="w-full aspect-square rounded-[20px] mb-3 border border-white/5 group-hover:scale-105 transition-transform" style={{ backgroundColor: c.color }} />
                <div className="text-sm font-bold">{c.name}</div>
                <div className="text-xs text-gray-500 font-mono">{c.color}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-[28px] p-10 text-center"
          >
            <h3 className="text-2xl font-black mb-3">Media Inquiries</h3>
            <p className="text-gray-400 mb-6">For interviews, quotes, or partnership opportunities</p>
            <a href="mailto:press@fintrack.app" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-full hover:shadow-xl hover:shadow-orange-500/30 transition-all">
              press@fintrack.app
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

export default PressKit;
