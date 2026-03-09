import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Scale, CreditCard, UserCheck, AlertTriangle, Ban, RefreshCw, Mail, Sparkles } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const sections = [
  { icon: UserCheck, title: '1. Account Terms', color: 'blue', content: 'You must be 13 years or older to use FinTrack. You are responsible for maintaining the security of your account credentials including your password, User ID, and security question. One person or legal entity may maintain no more than one free account. You are responsible for all activity that occurs under your account.' },
  { icon: CreditCard, title: '2. Payment & Refund Terms', color: 'emerald', content: 'Free tier users have access to core features at no charge. Paid plans begin with a 14-day free trial. You may cancel at any time during the trial period and you will not be charged. Once a payment has been made — whether after the trial ends or by subscribing directly without a trial — you are entitled to a full refund if requested within 14 days of the payment date. Refund requests must be submitted to our support team. After the 14-day window, no further refunds will be issued. Premium subscriptions are billed monthly or annually and your access continues until the end of the paid billing period.' },
  { icon: FileText, title: '3. Data Ownership', color: 'purple', content: 'You retain full ownership of all financial data you input into FinTrack. We do not claim any intellectual property rights over your content. You can export all your data at any time in standard formats (CSV, JSON). Upon account deletion, all your data is permanently removed within 30 days.' },
  { icon: Scale, title: '4. Acceptable Use', color: 'amber', content: 'You agree not to use FinTrack for any illegal financial activities, money laundering, or fraud. You must not attempt to access other users\' accounts or data. Automated scraping, bot usage, or API abuse is prohibited. We reserve the right to suspend accounts that violate these terms.' },
  { icon: AlertTriangle, title: '5. Liability Limits', color: 'red', content: 'FinTrack provides financial tracking tools — not financial advice. We are not liable for investment decisions made based on data shown in the app. Our maximum liability is limited to the amount you\'ve paid us in the last 12 months. We are not responsible for third-party service outages affecting our platform.' },
  { icon: Ban, title: '6. Termination', color: 'pink', content: 'Either party may terminate the agreement at any time. You can delete your account from settings. We may suspend accounts that violate our terms with 7 days notice (except for severe violations). Upon termination, your data export remains available for 30 days.' },
  { icon: RefreshCw, title: '7. Changes to Terms', color: 'cyan', content: 'We may update these terms from time to time. Material changes will be communicated via email at least 30 days before they take effect. Continued use after changes constitutes acceptance. If you disagree with changes, you may terminate your account.' },
  { icon: Mail, title: '8. Contact & Disputes', color: 'indigo', content: 'For any questions about these terms, contact legal@fintrack.app. Disputes will first be addressed through good-faith negotiation. If unresolved, disputes will be settled through arbitration. These terms are governed by the laws of the jurisdiction where FinTrack is incorporated.' },
];

const colorMap = { blue: 'from-blue-500 to-blue-600', emerald: 'from-emerald-500 to-emerald-600', purple: 'from-purple-500 to-purple-600', amber: 'from-amber-500 to-amber-600', red: 'from-red-500 to-red-600', pink: 'from-pink-500 to-pink-600', cyan: 'from-cyan-500 to-cyan-600', indigo: 'from-indigo-500 to-indigo-600' };
const bgMap = { blue: 'bg-blue-500/10 border-blue-500/20', emerald: 'bg-emerald-500/10 border-emerald-500/20', purple: 'bg-purple-500/10 border-purple-500/20', amber: 'bg-amber-500/10 border-amber-500/20', red: 'bg-red-500/10 border-red-500/20', pink: 'bg-pink-500/10 border-pink-500/20', cyan: 'bg-cyan-500/10 border-cyan-500/20', indigo: 'bg-indigo-500/10 border-indigo-500/20' };
const textMap = { blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400', amber: 'text-amber-400', red: 'text-red-400', pink: 'text-pink-400', cyan: 'text-cyan-400', indigo: 'text-indigo-400' };

const TermsOfService = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0 pointer-events-none">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 right-20 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">

      <section className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/30 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
              <Scale className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Fair & Transparent
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Terms of<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Service</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Plain-English terms. No surprises. Read everything you need to know about using FinTrack.
          </motion.p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((sec, i) => (
            <motion.div key={sec.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[24px] p-8 hover:border-white/15 transition-all duration-500"
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 ${bgMap[sec.color]} border rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <sec.icon className={`w-6 h-6 ${textMap[sec.color]}`} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-3 tracking-tight">{sec.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{sec.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pb-32 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-[32px] p-12">
          <h2 className="text-3xl font-black mb-4">Questions about terms?</h2>
          <p className="text-gray-400 mb-6">Reach our legal team at <span className="text-emerald-400 font-semibold">legal@fintrack.app</span></p>
          <Link to="/" className="inline-flex px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">Back to Home</Link>
        </motion.div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default TermsOfService;
