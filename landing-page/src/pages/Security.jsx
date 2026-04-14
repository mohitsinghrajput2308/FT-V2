import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Lock, Eye, Server, Key, FileCheck, AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

const practices = [
  { icon: Lock, title: 'Encryption', desc: 'AES-256 encryption at rest, TLS 1.3 for data in transit. Your financial information is encrypted and secure.', gradient: 'from-red-500 to-rose-500' },
  { icon: Eye, title: 'Data Privacy', desc: 'We\'re transparent about what data we collect and how we use it. No selling user data to third parties.', gradient: 'from-orange-500 to-amber-500' },
  { icon: Server, title: 'Infrastructure', desc: 'Hosted on secure, reliable infrastructure with automated backups and regular security updates.', gradient: 'from-blue-500 to-indigo-500' },
  { icon: Key, title: 'Two-Factor Authentication', desc: 'Optional TOTP-based 2FA available for additional account security.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: FileCheck, title: 'Row-Level Security', desc: 'Database policies ensure users can only access their own financial data. No exceptions.', gradient: 'from-purple-500 to-violet-500' },
  { icon: AlertTriangle, title: 'Abuse Protection', desc: 'Rate limiting and monitoring to protect against brute force attacks and credential stuffing.', gradient: 'from-pink-500 to-rose-500' },
];

const certifications = [
  { title: 'GDPR Compliant', status: 'Compliant', desc: 'Full compliance with EU General Data Protection Regulation' },
  { title: 'SOC 2 Type II', status: 'In Progress', desc: 'Working toward annual audit of security, availability & confidentiality controls' },
  { title: 'Data Encryption', status: 'Implemented', desc: 'AES-256 encryption at rest, TLS 1.3 for data in transit' },
  { title: 'Security Practices', status: 'Active', desc: 'Continuous monitoring, regular security reviews, and responsible disclosure' },
];

const timeline = [
  { date: 'Q2 2025', event: 'Pursuing SOC 2 Type II certification' },
  { date: 'Q1 2025', event: 'GDPR compliance audit completed' },
  { date: 'Q4 2024', event: '2FA (TOTP) security feature launched' },
  { date: 'Q3 2024', event: 'Row-level database security enabled' },
  { date: 'Q2 2024', event: 'AES-256 encryption deployed' },
];

const Security = () => {
  const { modalState, closeModal } = useAuthModal();
  const [vulnerabilityForm, setVulnerabilityForm] = useState({ email: '', description: '', severity: 'medium' });
  const [isSubmittingVuln, setIsSubmittingVuln] = useState(false);
  const [vulnSubmitStatus, setVulnSubmitStatus] = useState(null);

  const handleVulnerabilitySubmit = async () => {
    if (!vulnerabilityForm.email.trim() || !vulnerabilityForm.description.trim()) {
      setVulnSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }
    setIsSubmittingVuln(true);
    try {
      // Store vulnerability report in Supabase
      const { data, error } = await supabase
        .from('security_vulnerabilities')
        .insert({
          reporter_email: vulnerabilityForm.email.trim().toLowerCase(),
          severity: vulnerabilityForm.severity,
          description: vulnerabilityForm.description.trim(),
          status: 'pending',
          reported_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Send notification email (via Edge Function or API)
      try {
        await fetch('/api/send-security-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporter_email: vulnerabilityForm.email,
            severity: vulnerabilityForm.severity,
            description: vulnerabilityForm.description,
          }),
        });
      } catch (emailError) {
        console.log('Email notification pending manual review');
      }

      setVulnSubmitStatus({ 
        type: 'success', 
        message: '✓ Report submitted successfully. Our security team will review this within 48 hours. You will receive updates at ' + vulnerabilityForm.email 
      });
      
      setTimeout(() => {
        setVulnerabilityForm({ email: '', description: '', severity: 'medium' });
        setVulnSubmitStatus(null);
      }, 7000);
    } catch (error) {
      console.error('Submission error:', error);
      setVulnSubmitStatus({ 
        type: 'error', 
        message: 'Submission failed. Please email security@fintrack.app directly with subject: [SECURITY] Vulnerability Report' 
      });
    } finally {
      setIsSubmittingVuln(false);
    }
  };

  return (
  <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
    <div className="fixed inset-0 z-0 pointer-events-none">
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-[120px]" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-rose-600/8 rounded-full blur-[100px]" />
    </div>
    <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    <div className="relative z-10">

      <section className="pt-40 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-red-500/30 hover:-rotate-12 transition-transform duration-500">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-black tracking-[0.3em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Trust & Safety
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Security<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-pink-400">First</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              We take your financial security seriously. Here's what we do to protect your data and maintain your trust.
          </motion.p>
        </div>
      </section>

      {/* Security Practices */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {practices.map((p, i) => (
            <motion.div key={p.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="group bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-white mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Certifications & Compliance</motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.map((c, i) => (
              <motion.div key={c.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-5 flex items-start gap-4"
              >
                <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${c.status === 'In Progress' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white">{c.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{c.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Timeline */}
      <section className="pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Security Timeline</motion.h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-rose-500/30 to-transparent" />
            {timeline.map((t, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex gap-5 mb-6">
                <div className="w-12 flex-shrink-0 flex justify-center relative">
                  <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20 mt-1.5" />
                </div>
                <div className="pb-6">
                  <div className="text-xs text-red-400 font-bold mb-1">{t.date}</div>
                  <p className="text-gray-300 text-sm">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Responsible Disclosure</motion.h2>
          
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-[28px] p-10 mb-8"
          >
            <h3 className="text-xl font-black mb-3">Report a Security Issue</h3>
            <p className="text-gray-400 mb-6">Found a vulnerability? We take security seriously and appreciate responsible disclosure. Please report it to our security team.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Your Email</label>
                <input 
                  type="email" 
                  value={vulnerabilityForm.email}
                  onChange={(e) => setVulnerabilityForm({ ...vulnerabilityForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:border-red-500/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300 block mb-2">Severity Level</label>
                <select 
                  value={vulnerabilityForm.severity}
                  onChange={(e) => setVulnerabilityForm({ ...vulnerabilityForm, severity: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500/50 focus:outline-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="low" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Low</option>
                  <option value="medium" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Medium</option>
                  <option value="high" style={{ backgroundColor: '#1f2937', color: '#fff' }}>High</option>
                  <option value="critical" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Critical</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 block mb-2">Vulnerability Description</label>
                <textarea 
                  value={vulnerabilityForm.description}
                  onChange={(e) => setVulnerabilityForm({ ...vulnerabilityForm, description: e.target.value })}
                  placeholder="Describe the vulnerability in detail..."
                  rows="4"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-red-500/50 focus:outline-none resize-none"
                />
              </div>

              {vulnSubmitStatus && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm font-semibold ${
                    vulnSubmitStatus.type === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}
                >
                  {vulnSubmitStatus.message}
                </motion.div>
              )}
              
              <button
                onClick={handleVulnerabilitySubmit}
                disabled={isSubmittingVuln}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 rounded-lg hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmittingVuln ? 'Submitting...' : 'Submit Vulnerability Report'}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">Or email directly to: <span className="text-gray-400 font-mono">security@fintrack.app</span></p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-8"
          >
            <h4 className="font-black text-white mb-4">Our Commitment</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will acknowledge receipt of your report within 24 hours via email</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will send updates to the email you provided as we investigate</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will work to fix confirmed vulnerabilities quickly and notify you</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will credit you publicly (if desired) when we ship the fix</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will not pursue legal action against good-faith reporters</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>
      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  </div>
);
};

export default Security;
