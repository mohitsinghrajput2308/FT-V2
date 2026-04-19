import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, Search, Book, MessageSquare, Video, ChevronDown, ChevronRight, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const categoryConfig = [
  { id: 'getting_started', icon: Book, title: 'Getting Started', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'account_billing', icon: MessageSquare, title: 'Account & Billing', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'features_howttos', icon: Video, title: 'Features & How-Tos', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'troubleshooting', icon: HelpCircle, title: 'Troubleshooting', gradient: 'from-red-500 to-rose-500' },
];

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openIdx, setOpenIdx] = useState(null);
  const [articles, setArticles] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);

  const { modalState, closeModal } = useAuthModal();
  const { currentUser } = useAuth();

  // Fetch user subscription tier
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!currentUser) {
        setUserSubscription('free');
        return;
      }
      
      try {
        const { data, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', currentUser.id)
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Subscription fetch error:', subscriptionError);
        }
        
        setUserSubscription(data?.plan || 'free');
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setUserSubscription('free');
      }
    };

    fetchUserSubscription();
  }, [currentUser]);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all articles - RLS will handle what this user can see
        const { data, error: fetchError } = await supabase
          .from('help_articles')
          .select('*')
          .eq('is_published', true)
          .order('category')
          .order('sort_order');

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          setArticles([]);
          return;
        }

        setArticles(data);

        // Calculate category counts
        const counts = {};
        categoryConfig.forEach(cat => {
          counts[cat.id] = data.filter(a => a.category === cat.id).length;
        });
        setCategoryCounts(counts);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Could not load help articles. Please try again later.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [userSubscription]);
  // Filter articles based on search and selected category
  const filteredArticles = articles.filter(a => {
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesSearch = !query || 
      a.title.toLowerCase().includes(query.toLowerCase()) || 
      a.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
      a.content.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedArticles = selectedCategory ? filteredArticles : filteredArticles.slice(0, 8);

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

        {/* Error message */}
        {error && (
          <section className="pb-8 px-6">
            <div className="max-w-5xl mx-auto bg-red-500/10 border border-red-500/30 rounded-[20px] p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-300 mb-1">Unable to Load Articles</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryConfig.map((cat, i) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.div 
                  key={cat.id} 
                  custom={i} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`group cursor-pointer rounded-[20px] p-6 transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br ' + cat.gradient + ' border border-white/20 shadow-xl shadow-sky-500/20' 
                      : 'bg-[#0A0A0B] border border-white/5 hover:border-sky-500/30'
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br ' + cat.gradient
                  } group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-white mb-1 text-center">{cat.title}</h3>
                  <p className="text-gray-300 text-sm text-center font-medium">{count} articles</p>
                  {!isSelected && <ChevronRight className="w-4 h-4 text-gray-600 mx-auto mt-2 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />}
                  {isSelected && <div className="w-1 h-1 rounded-full bg-white mx-auto mt-2"></div>}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Articles */}
        <section className="pb-32 px-6">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-4" />
                <p className="text-gray-400">Loading articles...</p>
              </div>
            ) : displayedArticles.length === 0 ? (
              <div className="text-center py-20">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg mb-2">No articles found</p>
                <p className="text-gray-500 text-sm">Try a different search or category</p>
              </div>
            ) : (
              <>
                <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">
                  {selectedCategory ? `${categoryConfig.find(c => c.id === selectedCategory)?.title} (${filteredArticles.length})` : 'Frequently Asked Questions'}
                </motion.h2>
                <div className="space-y-3">
                  {displayedArticles.map((article, i) => (
                    <motion.div key={article.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                      <button onClick={() => setOpenIdx(openIdx === article.id ? null : article.id)}
                        className={`w-full bg-[#0A0A0B] border rounded-[16px] p-5 text-left transition-all ${openIdx === article.id ? 'border-sky-500/30' : 'border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="font-bold text-white text-lg">{article.title}</span>
                            {article.excerpt && <p className="text-gray-500 text-xs mt-1">{article.excerpt}</p>}
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openIdx === article.id ? 'rotate-180 text-sky-400' : ''}`} />
                        </div>
                        <AnimatePresence>
                          {openIdx === article.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-gray-400 text-sm mt-4 pt-4 border-t border-white/5 whitespace-pre-wrap">{article.content}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {selectedCategory && filteredArticles.length > displayedArticles.length && (
                  <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">Showing {displayedArticles.length} of {filteredArticles.length} articles</p>
                  </div>
                )}
              </>
            )}

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
