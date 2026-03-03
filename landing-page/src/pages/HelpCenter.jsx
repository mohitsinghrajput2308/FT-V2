import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, Search, Book, MessageSquare, Video, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const categories = [
  { icon: Book, title: 'Getting Started', count: 12, gradient: 'from-blue-500 to-cyan-500' },
  { icon: MessageSquare, title: 'Account & Billing', count: 8, gradient: 'from-emerald-500 to-teal-500' },
  { icon: Video, title: 'Features & How-Tos', count: 15, gradient: 'from-purple-500 to-indigo-500' },
  { icon: HelpCircle, title: 'Troubleshooting', count: 10, gradient: 'from-red-500 to-rose-500' },
];

const faqs = [
  { q: 'How do I create an account?', a: 'Click "Get Started" on the homepage, fill in your details including a unique User ID, set a security question, and verify your email. You\'ll be up and running in under 2 minutes.' },
  { q: 'Is my financial data secure?', a: 'Absolutely. We use AES-256 encryption at rest, TLS 1.3 in transit, row-level security on all database tables, and optional 2FA. We never sell or share your data.' },
  { q: 'Can I import transactions from my bank?', a: 'Yes! We support CSV import and integration with major banks through Plaid. Go to Settings → Import Data to get started.' },
  { q: 'How do I set up budgets?', a: 'Navigate to the Budget tab, tap "Create Budget", choose a category (or create a custom one), set your monthly limit, and we\'ll track your spending automatically.' },
  { q: 'What happens if I forget my password?', a: 'You can reset it via email or by answering your security question. Go to the login screen and click "Forgot Password" to see both options.' },
  { q: 'Is there a free plan?', a: 'Yes! FinTrack offers a generous free tier with unlimited transaction tracking, basic budgets, and analytics. Premium unlocks AI insights, multi-currency, and advanced reports.' },
  { q: 'How do I enable two-factor authentication?', a: 'During login, you\'ll be prompted to optionally set up 2FA. You can also enable it later from Settings → Security → Two-Factor Authentication.' },
  { q: 'Can I export my data?', a: 'You can export all your data in CSV or JSON format anytime from Settings → Data → Export. Your data belongs to you.' },
];

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const filteredFaqs = faqs.filter(f => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()));

  const { modalState, closeModal } = useAuthModal();
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 right-1/3 w-[500px] h-[500px] bg-sky-600/8 rounded-full blur-[120px]" />
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
      </div>
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10">

        <section className="pt-40 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-sky-500/30 hover:-rotate-12 transition-transform duration-500">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Support
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Help<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">Center</span>
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="max-w-xl mx-auto mt-8 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for help..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white text-lg focus:border-sky-500/50 focus:outline-none transition-colors" />
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <motion.div key={c.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-sky-500/30 transition-all cursor-pointer text-center"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <c.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-black text-white mb-1">{c.title}</h3>
                <p className="text-gray-600 text-sm">{c.count} articles</p>
                <ChevronRight className="w-4 h-4 text-gray-600 mx-auto mt-2 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-32 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Frequently Asked Questions</motion.h2>
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    className={`w-full bg-[#0A0A0B] border rounded-[16px] p-5 text-left transition-all ${openIdx === i ? 'border-sky-500/30' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openIdx === i ? 'rotate-180 text-sky-400' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {openIdx === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-400 text-sm mt-3 pt-3 border-t border-white/5">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 text-gray-600">No matching questions. Try a different search.</div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-12 bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 rounded-[28px] p-10 text-center"
            >
              <h3 className="text-2xl font-black mb-3">Still need help?</h3>
              <p className="text-gray-400 mb-6">Our support team is available 24/7</p>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold px-8 py-3 rounded-full hover:shadow-xl hover:shadow-sky-500/30 transition-all">
                <ExternalLink className="w-4 h-4" /> Contact Support
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

export default HelpCenter;
