import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Sparkles, MessageCircle, Github, ExternalLink, Heart, Trophy, Star } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const platforms = [
  { icon: MessageCircle, title: 'Discord Server', desc: 'Chat with 15,000+ community members', members: '15K+', link: '#', gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500/10' },
  { icon: Github, title: 'GitHub Discussions', desc: 'Report bugs, request features, contribute', members: '2.5K+', link: '#', gradient: 'from-gray-400 to-gray-600', bg: 'bg-gray-500/10' },
  { icon: Users, title: 'Reddit Community', desc: 'r/FinTrackApp — tips, tricks & discussions', members: '8K+', link: '#', gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10' },
  { icon: ExternalLink, title: 'Twitter / X', desc: '@FinTrackApp — updates, polls & memes', members: '25K+', link: '#', gradient: 'from-sky-500 to-blue-500', bg: 'bg-sky-500/10' },
];

const contributors = [
  { name: 'Sarah C.', contributions: 127, badge: 'Core Team', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Alex K.', contributions: 89, badge: 'Maintainer', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Maya P.', contributions: 56, badge: 'Top Contributor', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'James L.', contributions: 43, badge: 'Top Contributor', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Lena R.', contributions: 38, badge: 'Rising Star', gradient: 'from-rose-500 to-pink-500' },
  { name: 'David M.', contributions: 31, badge: 'Rising Star', gradient: 'from-indigo-500 to-violet-500' },
];

const events = [
  { title: 'Monthly Community Call', date: 'First Friday of every month', desc: 'Join us for product updates, Q&A, and sneak peeks at upcoming features.' },
  { title: 'FinTrack Hackathon 2025', date: 'March 15–17, 2025', desc: 'Build integrations, plugins, or creative tools using the FinTrack API. $10K in prizes!' },
  { title: 'Finance Literacy Workshop', date: 'Every Wednesday, 2PM EST', desc: 'Free weekly workshops on budgeting, investing, and financial planning.' },
];

const Community = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-pink-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
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
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-pink-500/30 hover:-rotate-12 transition-transform duration-500">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Community
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Join the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Movement</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Connect with 50,000+ members building better financial futures together.
          </motion.p>
        </div>
      </section>

      {/* Platforms */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
          {platforms.map((p, i) => (
            <motion.a key={p.title} href={p.link} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-pink-500/30 transition-all block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <p.icon className="w-7 h-7 text-white" />
                </div>
                <span className={`${p.bg} text-xs font-bold px-3 py-1 rounded-full text-gray-300`}>{p.members} members</span>
              </div>
              <h3 className="font-black text-white group-hover:text-pink-400 transition-colors mb-1">{p.title}</h3>
              <p className="text-gray-500 text-sm">{p.desc}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Top Contributors */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">
            <Trophy className="w-8 h-8 inline-block text-amber-400 mb-1 mr-2" /> Top Contributors
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributors.map((c, i) => (
              <motion.div key={c.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-5 flex items-center gap-4 hover:border-pink-500/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white text-sm">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {c.contributions} contributions</span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">{c.badge}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Upcoming Events</motion.h2>
          <div className="space-y-4">
            {events.map((e, i) => (
              <motion.div key={e.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-purple-500/20 transition-all"
              >
                <div className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-2">{e.date}</div>
                <h3 className="font-black text-white text-lg mb-2">{e.title}</h3>
                <p className="text-gray-500 text-sm">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default Community;
