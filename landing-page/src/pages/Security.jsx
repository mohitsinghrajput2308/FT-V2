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
  { icon: Lock, title: 'Encryption', desc: 'AES-256 encryption at rest, TLS 1.2+ for all data in transit (TLS 1.3 in progress). All financial data encrypted end-to-end with zero access by third parties.', gradient: 'from-red-500 to-rose-500' },
  { icon: Eye, title: 'Data Privacy & Control', desc: 'GDPR Article 18 & 21: Users can restrict data processing or object to any use. Financial data is isolated from analytics. We never sell data to third parties.', gradient: 'from-orange-500 to-amber-500' },
  { icon: Server, title: 'Infrastructure & Backup', desc: 'Supabase Pro hosted in EU (eu-west-1). 4-tier backup strategy: native replication, daily encrypted exports (S3), transaction logs (5-min RPO), & automated testing.', gradient: 'from-blue-500 to-indigo-500' },
  { icon: Key, title: 'Cryptographic Key Management', desc: 'Automated 90-day key rotation for all JWT, API, and encryption keys with rollback capability. Zero keys stored in code or git.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: FileCheck, title: 'Database Security', desc: 'Row-Level Security (RLS) enforced on all tables. Users can only access their own financial data. Immutable audit logs for compliance.', gradient: 'from-purple-500 to-violet-500' },
  { icon: AlertTriangle, title: 'Threat Detection & Response', desc: 'Real-time monitoring detects brute force (auto-lock 30min), RLS violations, API abuse, & data exfiltration. Automated 72-hour GDPR breach notification to users & authorities.', gradient: 'from-pink-500 to-rose-500' },
];

const certifications = [
  { title: 'GDPR Compliance', status: 'Implemented', desc: 'Complete GDPR framework deployed: User consent controls (Article 18), right to object (Article 21), 72-hour breach notification (Article 33), & DPA templates for processors.' },
  { title: 'SOC 2 Type II', status: 'In Progress', desc: '22 of 28 SOC 2 security controls implemented (77% complete). On track for Type II audit engagement in June 2026 with report expected October 2026.' },
  { title: 'Data Encryption', status: 'Implemented', desc: 'AES-256 encryption at rest (Supabase managed), TLS 1.2+ for all data in transit, TLS 1.3 minimum rollout by May 2026 with Pro plan upgrade.' },
  { title: 'Security & Monitoring', status: 'Active', desc: 'Continuous 24/7 threat monitoring (5-min intervals): Brute force auto-lock, unauthorized access detection, API abuse prevention, automated incident response.' },
];

const timeline = [
  { date: 'Q2 2026 (June)', event: 'SOC 2 Type II audit engagement begins, DPA signatures expected complete with all vendors' },
  { date: 'Q2 2026 (May)', event: 'Supabase Pro upgrade: TLS 1.3 minimum enforcement, regional data residency enabled' },
  { date: 'Q2 2026 (April)', event: 'Penetration testing engagement planned, staff security training program complete' },
  { date: 'Q1 2026 (January)', event: 'GDPR user controls (Article 18/21) deployed, analytics isolation active, key rotation & monitoring live' },
  { date: 'Q4 2025', event: 'Security frameworks finalized: GDPR, SOC 2, Incident Response Plan, DPA templates' },
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
            <h3 className="text-xl font-black mb-3">Report a Security Vulnerability</h3>
            <p className="text-gray-400 mb-2">Found a vulnerability? Join us in making FinTrack secure. We take every report seriously and follow CVSS severity guidelines.</p>
            <p className="text-gray-500 text-sm mb-6">Reports are reviewed by our Security Team within 24 hours with updates every 72 hours until resolution.</p>
            
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
            className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-8 mb-8"
          >
            <h4 className="font-black text-white mb-4">Our Security Infrastructure (Live)</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>Real-time Threat Monitoring:</strong> 24/7 automated detection of brute force attacks (auto-lock), unauthorized database access (RLS), API abuse, and data exfiltration patterns</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>GDPR Article 18 & 21 Controls:</strong> Users can restrict processing or object to any use of their data with persistent audit trail</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>Automated Key Rotation:</strong> All cryptographic keys (JWT, API, encryption) rotate every 90 days with versioning and rollback capability</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>72-Hour Breach Response:</strong> Automatic incident notification to users and regulatory authorities within 72 hours (GDPR Article 33 compliant)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>4-Tier Backup Strategy:</strong> Native replication + daily encrypted exports + 5-minute transaction logs + application file backup with 1-hour RPO, 4-hour RTO</span>
              </li>
            </ul>
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
                <span>We will send updates every 72 hours as we investigate and fix</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will work to release patches within 30 days of confirmed critical vulnerabilities</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will credit you publicly (if desired) when the fix ships, and provide CVE if applicable</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>We will not pursue legal action against good-faith security researchers</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>All reports are logged in our compliance audit trail and archived per regulations</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Security Documentation */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Security & Compliance Documentation</motion.h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.a href="/docs/GDPR_COMPLIANCE_FRAMEWORK.md" target="_blank" rel="noopener noreferrer"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/30 transition-all"
            >
              <FileCheck className="w-6 h-6 text-red-400 mb-3" />
              <h3 className="font-black text-white mb-2">GDPR Compliance Framework</h3>
              <p className="text-gray-500 text-sm">Complete implementation guide for all 6 GDPR data subject rights, with audit procedures and templates.</p>
            </motion.a>

            <motion.a href="/docs/SOC2_CONTROL_MATRIX.md" target="_blank" rel="noopener noreferrer"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/30 transition-all"
            >
              <Shield className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-black text-white mb-2">SOC 2 Control Matrix</h3>
              <p className="text-gray-500 text-sm">77% implementation complete with evidence mapping for all 28 SOC 2 security controls.</p>
            </motion.a>

            <motion.a href="/docs/INCIDENT_RESPONSE_PLAN.md" target="_blank" rel="noopener noreferrer"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/30 transition-all"
            >
              <AlertTriangle className="w-6 h-6 text-orange-400 mb-3" />
              <h3 className="font-black text-white mb-2">Incident Response Plan</h3>
              <p className="text-gray-500 text-sm">7-step incident response procedures including breach notification, forensics, and recovery playbooks.</p>
            </motion.a>

            <motion.a href="/docs/DPA_TEMPLATE.md" target="_blank" rel="noopener noreferrer"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6 hover:border-red-500/30 transition-all"
            >
              <FileCheck className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-black text-white mb-2">Data Processing Agreements</h3>
              <p className="text-gray-500 text-sm">Ready-to-sign templates for all data processors (Supabase, Vercel, Paddle, Google, Crisp).</p>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Authentication & Access */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-black text-center mb-10">Authentication & Access Control</motion.h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6"
            >
              <Lock className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-black text-white mb-3">Sign In Securely</h3>
              <p className="text-gray-500 text-sm mb-4">All authentication flows use secure HTTPS with strong TLS encryption. Your credentials are never exposed to third parties.</p>
              <Link to="/auth" className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors">
                Sign In or Register →
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-[#0A0A0B] border border-white/5 rounded-[20px] p-6"
            >
              <Key className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-black text-white mb-3">Two-Factor Authentication</h3>
              <p className="text-gray-500 text-sm mb-4">Enhance your account security with Time-based One-Time Passwords (TOTP). Enable 2FA in your account settings.</p>
              <div className="text-gray-400 text-xs">Supported apps: Google Authenticator, Authy, Microsoft Authenticator</div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[20px] p-8 mt-6"
          >
            <h3 className="font-black text-white mb-4">Session Security</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>JWT Tokens:</strong> Signed JWTs expire after 1 hour. Refresh tokens valid for 30 days with automatic rotation.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>Session Monitoring:</strong> Unusual login activity immediately flagged. Brute force attempts trigger 30-minute account lock.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span><strong>Logout Everywhere:</strong> Sign out of all devices instantly if account compromised. Previous sessions immediately invalidated.</span>
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
