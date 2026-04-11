import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Sparkles, Loader2, Heart, Lightbulb, Bug, Volume2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const feedbackTypes = [
  { icon: Lightbulb, title: 'Feature Request', desc: 'Suggest a cool new feature', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { icon: Bug, title: 'Bug Report', desc: 'Found something broken?', color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500/10 border-red-500/20' },
  { icon: Heart, title: 'Praise & Love', desc: 'Tell us what you love', color: 'from-rose-500 to-red-500', bgColor: 'bg-rose-500/10 border-rose-500/20' },
  { icon: Volume2, title: 'General Feedback', desc: 'Share your thoughts', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
];

const FeedbackPage = () => {
  const [form, setForm] = useState({ name: '', email: '', type: 'General Feedback', feedback: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { modalState, closeModal } = useAuthModal();

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.feedback.trim()) return;
    setLoading(true);
    setSubmitError('');
    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .insert({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          type: form.type,
          feedback: form.feedback.trim(),
        });
      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => {
        setForm({ name: '', email: '', type: 'General Feedback', feedback: '' });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setSubmitError('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }} 
          transition={{ duration: 8, repeat: Infinity }} 
          className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }} 
          transition={{ duration: 10, repeat: Infinity }} 
          className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" 
        />
      </div>
      
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10">

        {/* Hero Section */}
        <section className="pt-40 pb-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Icon Badge */}
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', stiffness: 200, damping: 20 }} 
              className="inline-flex mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 hover:rotate-12 transition-transform duration-500">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }} 
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black tracking-[0.3em] uppercase mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> We Listen
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }} 
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]"
            >
              Share Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Feedback</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }} 
              className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
            >
              Your feedback directly shapes FinTrack's future. Whether it's a feature request, bug report, or love note — we want to hear it.
            </motion.p>
          </div>
        </section>

        {/* Feedback Types */}
        <section className="pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }} 
              className="text-3xl font-black text-center mb-12"
            >
              What can we improve?
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {feedbackTypes.map((type, i) => (
                <motion.div 
                  key={type.title} 
                  custom={i} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  className={`${type.bgColor} border rounded-[20px] p-6 text-center hover:border-white/30 transition-all cursor-pointer group hover:scale-105`}
                  style={{ perspective: '1000px' }}
                  whileHover={{ rotateY: 2, rotateX: -2 }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-white mb-1">{type.title}</h3>
                  <p className="text-gray-400 text-sm">{type.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="bg-[#0A0A0B] border border-white/5 rounded-[28px] p-8 md:p-10 hover:border-indigo-500/20 transition-all"
            >
              <h2 className="text-2xl font-black mb-8">Tell Us Your Thoughts</h2>
              
              {submitted ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="text-center py-12"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto mb-4 bg-indigo-500/10 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-indigo-400" />
                  </motion.div>
                  <h3 className="text-xl font-black mb-2">Thank You!</h3>
                  <p className="text-gray-400">Your feedback helps us build a better FinTrack.</p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Name</label>
                      <input 
                        type="text" 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-gray-100 focus:border-indigo-500/50 focus:outline-none transition-colors placeholder:text-gray-500" 
                        placeholder="Your name" 
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Email</label>
                      <input 
                        type="email" 
                        value={form.email} 
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-gray-100 focus:border-indigo-500/50 focus:outline-none transition-colors placeholder:text-gray-500" 
                        placeholder="you@email.com" 
                      />
                    </div>
                  </div>

                  {/* Feedback Type */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Feedback Type</label>
                    <select 
                      value={form.type} 
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-gray-100 focus:border-indigo-500/50 focus:outline-none transition-colors"
                    >
                      <option>General Feedback</option>
                      <option>Feature Request</option>
                      <option>Bug Report</option>
                      <option>Praise & Love</option>
                    </select>
                  </div>

                  {/* Feedback Message */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Your Feedback</label>
                    <textarea 
                      value={form.feedback} 
                      onChange={(e) => setForm({ ...form, feedback: e.target.value })} 
                      rows={6}
                      className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-gray-100 focus:border-indigo-500/50 focus:outline-none transition-colors resize-none placeholder:text-gray-500" 
                      placeholder="Share your thoughts, ideas, or report issues... (minimum 10 characters)" 
                    />
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {submitError}
                    </motion.p>
                  )}

                  {/* Submit Button */}
                  <motion.button 
                    onClick={handleSubmit}
                    disabled={loading || !form.name || !form.email || !form.feedback}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Why Your Feedback Matters */}
        <section className="pb-32 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { number: '100%', label: 'Read & Reviewed', icon: '👀' },
                { number: '2-3x', label: 'Meetings Per Week', icon: '💬' },
                { number: '∞', label: 'Impact', icon: '🚀' },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-[20px] p-6 text-center hover:border-indigo-500/40 transition-all"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{stat.number}</p>
                  <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 border border-indigo-500/15 rounded-[24px] p-8 text-center"
            >
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Every piece of feedback gets discussed in our weekly product meetings. Your thoughts directly influence what we build next. After you submit, you'll receive an email update on how your feedback impacted the product.
              </p>
              <Link 
                to="/" 
                className="inline-flex px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Back to Home
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
      
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  );
};

export default FeedbackPage;
