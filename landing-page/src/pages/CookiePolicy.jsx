import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, Settings, BarChart3, Shield, ToggleRight, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const cookies = [
  { icon: Shield, name: 'Essential Cookies', status: 'Always Active', color: 'emerald', statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Required for the app to function. These handle authentication, session management, and security. Cannot be disabled.', examples: ['Session tokens', 'CSRF protection', 'Auth state persistence'] },
  { icon: BarChart3, name: 'Analytics Cookies', status: 'Optional', color: 'blue', statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', desc: 'Help us understand how you use FinTrack so we can improve the experience. All data is anonymized and aggregated.', examples: ['Page view counts', 'Feature usage frequency', 'Performance metrics'] },
  { icon: Settings, name: 'Preference Cookies', status: 'Optional', color: 'purple', statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Remember your settings like theme preference (dark/light mode), language, currency format, and dashboard layout.', examples: ['Theme selection', 'Currency format', 'Dashboard layout'] },
  { icon: ToggleRight, name: 'Marketing Cookies', status: 'Disabled', color: 'gray', statusColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20', desc: 'We do NOT use marketing or advertising cookies. We will never track you for ad targeting purposes. Period.', examples: ['None — we don\'t do this'] },
];

const bgMap = { emerald: 'bg-emerald-500/10 border-emerald-500/20', blue: 'bg-blue-500/10 border-blue-500/20', purple: 'bg-purple-500/10 border-purple-500/20', gray: 'bg-gray-500/10 border-gray-500/20' };
const textMap = { emerald: 'text-emerald-400', blue: 'text-blue-400', purple: 'text-purple-400', gray: 'text-gray-400' };

const CookiePolicy = () => (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 right-20 w-[450px] h-[450px] bg-amber-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-20 left-20 w-[350px] h-[350px] bg-purple-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-8 left-8 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span className="text-sm font-semibold">Back</span>
        </Link>
      </motion.div>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-amber-500/30 hover:rotate-12 transition-transform duration-500">
              <Cookie className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Full Transparency
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Cookie<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">Policy</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            We use minimal cookies — and we're completely honest about each one. No dark patterns.
          </motion.p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {cookies.map((cookie, i) => (
            <motion.div key={cookie.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-8 hover:border-white/15 transition-all duration-500"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 ${bgMap[cookie.color]} border rounded-[16px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <cookie.icon className={`w-7 h-7 ${textMap[cookie.color]}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-lg font-black text-white tracking-tight">{cookie.name}</h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${cookie.statusColor}`}>{cookie.status}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{cookie.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {cookie.examples.map((ex) => (
                      <span key={ex} className="text-xs bg-white/5 border border-white/10 text-gray-500 px-3 py-1 rounded-full">{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pb-32 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-[32px] p-12">
          <h2 className="text-3xl font-black mb-4">Manage your preferences</h2>
          <p className="text-gray-400 mb-6">You can update cookie preferences anytime from your browser settings</p>
          <Link to="/" className="inline-flex px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">Back to Home</Link>
        </motion.div>
      </section>
    </div>
  </div>
);

export default CookiePolicy;
