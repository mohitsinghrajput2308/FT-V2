import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MapPin, Phone, MessageSquare, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const contactMethods = [
  { icon: Mail, title: 'Email Us', desc: 'support@fintrack.app', sub: 'We respond within 24 hours', gradient: 'from-teal-500 to-cyan-500' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Available in-app', sub: 'Mon–Fri, 9AM–6PM EST', gradient: 'from-blue-500 to-indigo-500' },
  { icon: Phone, title: 'Phone', desc: '+1 (555) 123-4567', sub: 'Mon–Fri, 9AM–5PM EST', gradient: 'from-emerald-500 to-teal-500' },
];

const offices = [
  { city: 'San Francisco', address: '100 Market St, Suite 400, CA 94105', tz: 'PST (UTC-8)' },
  { city: 'London', address: '10 Finsbury Square, EC2A 1AF', tz: 'GMT (UTC+0)' },
  { city: 'Singapore', address: '1 Raffles Place, Tower 2, #20-01', tz: 'SGT (UTC+8)' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-teal-600/8 rounded-full blur-[120px]" />
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[100px]" />
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
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-teal-500/30 hover:-rotate-12 transition-transform duration-500">
                <Mail className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Get In Touch
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Contact<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">Us</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Have a question, feedback, or need help? We'd love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5">
            {contactMethods.map((m, i) => (
              <motion.div key={m.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 text-center hover:border-teal-500/30 transition-all"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center`}>
                  <m.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-white mb-1">{m.title}</h3>
                <p className="text-teal-400 text-sm font-semibold">{m.desc}</p>
                <p className="text-gray-600 text-xs mt-1">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#0A0A0B] border border-white/5 rounded-[28px] p-8 md:p-10"
            >
              <h2 className="text-2xl font-black mb-8">Send a Message</h2>
              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-teal-500/10 rounded-full flex items-center justify-center">
                    <Send className="w-10 h-10 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-black mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Name</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 focus:outline-none transition-colors" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 focus:outline-none transition-colors" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Subject</label>
                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 focus:outline-none transition-colors" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Message</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-500/50 focus:outline-none transition-colors resize-none" placeholder="Tell us more..." />
                  </div>
                  <button onClick={() => setSubmitted(true)}
                    disabled={!form.name || !form.email || !form.message}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Offices */}
        <section className="pb-32 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-12">Our Offices</motion.h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {offices.map((o, i) => (
                <motion.div key={o.city} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-teal-500/30 transition-all"
                >
                  <MapPin className="w-6 h-6 text-teal-400 mb-3" />
                  <h3 className="font-black text-white mb-1">{o.city}</h3>
                  <p className="text-gray-500 text-sm mb-2">{o.address}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600"><Clock className="w-3 h-3" /> {o.tz}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
