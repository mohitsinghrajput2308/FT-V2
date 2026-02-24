import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, Zap, Globe, Coffee, GraduationCap, ArrowLeft, Sparkles, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const perks = [
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Full medical + mental health support' },
  { icon: Coffee, title: 'Unlimited PTO', desc: 'Take time off when you need it' },
  { icon: GraduationCap, title: 'Learning Budget', desc: '$3,000/year for courses & conferences' },
  { icon: Zap, title: 'Latest Equipment', desc: 'M3 MacBook Pro + 4K monitor setup' },
  { icon: Briefcase, title: 'Equity for All', desc: 'Stock options from day one' },
];

const openings = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Backend Engineer (Node.js)', team: 'Engineering', location: 'Remote', type: 'Full-time', gradient: 'from-purple-500 to-pink-500' },
  { title: 'AI/ML Engineer', team: 'AI Team', location: 'Remote / SF', type: 'Full-time', gradient: 'from-emerald-500 to-teal-500' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time', gradient: 'from-amber-500 to-orange-500' },
  { title: 'DevOps Engineer', team: 'Infrastructure', location: 'Remote', type: 'Full-time', gradient: 'from-red-500 to-rose-500' },
  { title: 'Growth Marketing Lead', team: 'Marketing', location: 'Remote / NYC', type: 'Full-time', gradient: 'from-indigo-500 to-blue-500' },
];

const Careers = () => (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
    <div className="fixed inset-0 z-0">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-[100px]" />
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
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-purple-500/30 hover:-rotate-12 transition-transform duration-500">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Join Our Team
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Build the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">Future</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Help millions take control of their financial future. We're hiring exceptional people who care about making a difference.
          </motion.p>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Why FinTrack?</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p, i) => (
              <motion.div key={p.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-purple-500/30 transition-all"
              >
                <p.icon className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-white mb-1">{p.title}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Open Positions</motion.h2>
          <div className="space-y-4">
            {openings.map((job, i) => (
              <motion.div key={job.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-white/15 transition-all flex items-center justify-between flex-wrap gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${job.gradient}`} />
                  <div>
                    <h3 className="font-black text-white group-hover:text-purple-400 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{job.team}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                    </div>
                  </div>
                </div>
                <span className="text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform">Apply →</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default Careers;
