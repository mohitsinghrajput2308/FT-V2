import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Sparkles, Clock, User, Tag, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const categories = ['All', 'Product', 'Engineering', 'Finance Tips', 'Company'];

const posts = [
  { title: 'Introducing AI-Powered Budget Insights', excerpt: 'Our new AI engine analyzes your spending patterns and provides personalized recommendations to optimize your budget.', category: 'Product', author: 'Sarah Chen', date: 'Jan 15, 2025', readTime: '5 min', gradient: 'from-purple-500 to-indigo-500', featured: true },
  { title: 'How We Scaled to 500K Users', excerpt: 'A deep dive into our infrastructure journey from a single server to a globally distributed, fault-tolerant system.', category: 'Engineering', author: 'Alex Kim', date: 'Jan 10, 2025', readTime: '8 min', gradient: 'from-blue-500 to-cyan-500', featured: true },
  { title: '5 Budgeting Mistakes to Avoid in 2025', excerpt: 'Common pitfalls that prevent people from reaching their financial goals, and how to fix them.', category: 'Finance Tips', author: 'Maya Patel', date: 'Jan 6, 2025', readTime: '4 min', gradient: 'from-emerald-500 to-teal-500' },
  { title: 'Our Series B: What It Means for You', excerpt: 'We raised $40M to accelerate product development and expand internationally. Here\'s our roadmap.', category: 'Company', author: 'James Liu', date: 'Dec 28, 2024', readTime: '3 min', gradient: 'from-amber-500 to-orange-500' },
  { title: 'Building Real-Time Sync with CRDTs', excerpt: 'How we implemented conflict-free replicated data types for seamless offline-first budgeting.', category: 'Engineering', author: 'Alex Kim', date: 'Dec 20, 2024', readTime: '10 min', gradient: 'from-pink-500 to-rose-500' },
  { title: 'The Psychology of Saving Money', excerpt: 'Understanding behavioral economics can help you build better financial habits. Here are strategies backed by science.', category: 'Finance Tips', author: 'Maya Patel', date: 'Dec 15, 2024', readTime: '6 min', gradient: 'from-violet-500 to-purple-500' },
];

const Blog = () => {
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');
  const filtered = posts.filter(p => (active === 'All' || p.category === active) && (!query || p.title.toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-8 left-8 z-50">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /><span className="text-sm font-semibold">Back</span>
          </Link>
        </motion.div>

        <section className="pt-32 pb-10 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-violet-500/30 hover:rotate-12 transition-transform duration-500">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Our Blog
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Insights &<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400">Stories</span>
            </motion.h1>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="pb-10 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-8"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-violet-500/50 focus:outline-none transition-colors text-sm" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setActive(c)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${active === c ? 'bg-violet-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Posts */}
        {active === 'All' && !query && (
          <section className="pb-10 px-6">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
              {posts.filter(p => p.featured).map((post, i) => (
                <motion.div key={post.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] overflow-hidden hover:border-violet-500/30 transition-all cursor-pointer"
                >
                  <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative`}>
                    <BookOpen className="w-16 h-16 text-white/20" />
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Featured</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-3 h-3 text-violet-400" />
                      <span className="text-xs text-violet-400 font-bold">{post.category}</span>
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-violet-400 transition-colors mb-2">{post.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</div>
                      <div className="flex items-center gap-3">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="pb-32 px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {filtered.map((post, i) => (
              <motion.div key={post.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-white/15 transition-all cursor-pointer flex items-center gap-5"
              >
                <div className={`hidden sm:flex w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${post.gradient} items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-violet-400 font-black uppercase tracking-wider">{post.category}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-600">{post.date}</span>
                  </div>
                  <h3 className="font-black text-white group-hover:text-violet-400 transition-colors truncate">{post.title}</h3>
                  <p className="text-gray-500 text-sm truncate">{post.excerpt}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-600">No articles found matching your search.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blog;
