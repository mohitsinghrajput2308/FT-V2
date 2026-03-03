import React, { useState } from 'react';
import { Mail, MessageCircle, Send, Disc, Users, Globe, ArrowRight, Sparkles, Youtube, Linkedin, Github, Instagram, Facebook, Twitter, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackNewsletterSubscribe } from '../utils/analytics';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 192 192" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.248.054 14.474 2.452 18.502 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.808-.169-40.06-7.483-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.206 17.11 97.014 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.643 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854 14.504 18.436 36.094 27.884 64.199 28.079h.113c24.96-.166 42.502-6.72 57.048-21.253 18.963-18.945 18.392-42.692 12.137-57.27-4.484-10.454-13.033-18.945-24.748-24.489zm-45.99 55.867c-10.427.587-21.258-4.098-21.816-14.135-.404-7.558 5.373-15.984 22.748-17.014 1.988-.114 3.94-.17 5.856-.17 6.405 0 12.418.616 17.932 1.776-2.04 25.504-14.496 28.94-24.72 29.543z" />
  </svg>
);

const QuoraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12.005 0C5.373 0 0 5.372 0 12.003c0 6.63 5.372 12 12.005 12 6.63 0 12.002-5.37 12.002-12C24.007 5.372 18.635 0 12.005 0zm4.638 18.317c-.523-1.102-1.15-2.165-2.386-2.165-.276 0-.55.046-.806.138l-.458-1.1c.67-.441 1.598-.717 2.606-.717 1.7 0 2.845.826 3.637 2.017a6.45 6.45 0 0 1-2.593 1.827zm-4.63.72c-3.542 0-6.415-2.873-6.415-6.415 0-3.545 2.873-6.418 6.415-6.418 3.543 0 6.416 2.873 6.416 6.418 0 1.275-.375 2.465-1.017 3.463-.578-.793-1.319-1.441-2.408-1.441-.38 0-.76.082-1.12.22l.477 1.1a2.1 2.1 0 0 1 .645-.1c.586 0 1.052.302 1.452.773a6.46 6.46 0 0 1-4.045 1.4z" />
  </svg>
);
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export const Footer = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle | loading | success | error
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email.');
      return;
    }
    setNewsletterStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email, source: 'footer' }, { onConflict: 'email' });
      if (error) throw error;
      setNewsletterStatus('success');
      setNewsletterMsg("You're in! We'll keep you updated.");
      setNewsletterEmail('');
      trackNewsletterSubscribe();
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMsg('Something went wrong. Try again.');
    }
  };

  const footerLinks = {
    Product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', to: '/pricing' },
      { name: 'Security', to: '/security' },
      { name: 'Roadmap', to: '/roadmap' },
      { name: 'Changelog', to: '/changelog' }
    ],
    Company: [
      { name: 'About Us', to: '/about' },
      { name: 'Careers', to: '/careers' },
      { name: 'Press Kit', to: '/press' },
      { name: 'Contact', to: '/contact' }
    ],
    Resources: [
      { name: 'Blog', to: '/blog' },
      { name: 'Help Center', to: '/help' },
      { name: 'API Docs', to: '/api-docs' },
      { name: 'Community', to: '/community' }
    ],
    Legal: [
      { name: 'Privacy Policy', to: '/privacy' },
      { name: 'Terms of Service', to: '/terms' },
      { name: 'Cookie Policy', to: '/cookies' },
      { name: 'GDPR', to: '/gdpr' }
    ]
  };


  return (
    <footer className="text-gray-300" style={{ background: '#0C0A07' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-4">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                alt="FinTrack Logo"
                className="h-20 w-auto brightness-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform duration-300 hover:scale-110"
              />
            </div>
            <p className="mb-2 max-w-sm text-[15px] leading-relaxed" style={{ color: '#A8977A' }}>
              Your money tells a story. <span className="font-semibold" style={{ color: '#FFFBF0' }}>FinTrack</span> helps you write a better one — with AI that listens, learns, and lights the way to financial freedom.
            </p>
            <p className="text-xs italic mb-5" style={{ color: '#5C5040' }}>Built for dreamers. Designed for doers.</p>

            {/* Newsletter Signup */}
            <div className="max-w-sm">
              <h4 className="text-sm font-semibold mb-2" style={{ color: '#FFFBF0' }}>Stay in the loop</h4>
              {newsletterStatus === 'success' ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  {newsletterMsg}
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={newsletterEmail}
                    onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus('idle'); }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {newsletterStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-xs text-red-400 mt-1">{newsletterMsg}</p>
              )}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4" style={{ color: '#FFFBF0' }}>{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="hover:text-amber-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          if (link.href.startsWith('/#')) {
                            window.location.href = link.href;
                          } else {
                            navigate(link.href);
                          }
                        }}
                        className="hover:text-amber-400 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Community Hub Section — full width so map fills edge to edge */}
      <div className="relative overflow-hidden py-12" style={{ borderTop: '1px solid #1F1A12' }}>
        {/* World map background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/world_map2.avif"
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.12, mixBlendMode: 'luminosity' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black tracking-[0.25em] uppercase mb-4"
              style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#FBBF24' }}>
              <Sparkles className="w-3.5 h-3.5" /> Connected Everywhere
            </div>
            <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight" style={{ color: '#FFFBF0' }}>
              Join Our <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #F59E0B, #EA580C, #DC2626)' }}>Global Community</span>
            </h3>
            <p className="max-w-lg mx-auto" style={{ color: '#A8977A' }}>
              50,000+ members across 8 platforms. Pick your favorite — or join them all.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
            {[
              { value: '50K+', label: 'Members', icon: Users },
              { value: '120+', label: 'Countries', icon: Globe },
              { value: '24/7', label: 'Active Chat', icon: MessageCircle },
              { value: '99%', label: 'Satisfaction', icon: Sparkles },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4 text-center group transition-all duration-300"
                style={{ background: 'rgba(28,22,12,0.6)', border: '1px solid rgba(161,98,7,0.15)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(217,119,6,0.35)'; e.currentTarget.style.background = 'rgba(28,22,12,0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(161,98,7,0.15)'; e.currentTarget.style.background = 'rgba(28,22,12,0.6)'; }}>
                <stat.icon className="w-4 h-4 mx-auto mb-1.5 group-hover:scale-110 transition-transform" style={{ color: '#FBBF24' }} />
                <div className="text-xl font-black" style={{ color: '#FFFBF0' }}>{stat.value}</div>
                <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: '#6B5E4B' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* App Grid — 12 platforms */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8">
            {[
              { name: 'WhatsApp', href: 'https://wa.me/#', icon: MessageCircle, members: '12K Members', action: 'Join', gradient: 'linear-gradient(135deg,#25D366,#128C7E)', accent: '#25D366', shadow: 'rgba(37,211,102,0.2)', hoverShadow: 'rgba(37,211,102,0.4)', hoverBorder: 'rgba(37,211,102,0.4)' },
              { name: 'Telegram', href: 'https://t.me/#', icon: Send, members: '8K Members', action: 'Join', gradient: 'linear-gradient(135deg,#2AABEE,#229ED9)', accent: '#2AABEE', shadow: 'rgba(42,171,238,0.2)', hoverShadow: 'rgba(42,171,238,0.4)', hoverBorder: 'rgba(42,171,238,0.4)' },
              { name: 'Discord', href: 'https://discord.gg/#', icon: Disc, members: '15K Members', action: 'Join', gradient: 'linear-gradient(135deg,#5865F2,#4752C4)', accent: '#5865F2', shadow: 'rgba(88,101,242,0.2)', hoverShadow: 'rgba(88,101,242,0.4)', hoverBorder: 'rgba(88,101,242,0.4)' },
              { name: 'YouTube', href: 'https://youtube.com/#', icon: Youtube, members: '5K Subscribers', action: 'Subscribe', gradient: 'linear-gradient(135deg,#FF0000,#CC0000)', accent: '#FF4444', shadow: 'rgba(255,0,0,0.2)', hoverShadow: 'rgba(255,0,0,0.4)', hoverBorder: 'rgba(255,68,68,0.4)' },
              { name: 'LinkedIn', href: 'https://linkedin.com/company/#', icon: Linkedin, members: '7K Network', action: 'Connect', gradient: 'linear-gradient(135deg,#0A66C2,#004182)', accent: '#0A66C2', shadow: 'rgba(10,102,194,0.2)', hoverShadow: 'rgba(10,102,194,0.4)', hoverBorder: 'rgba(10,102,194,0.4)' },
              { name: 'Instagram', href: 'https://instagram.com/#', icon: Instagram, members: '9K Followers', action: 'Follow', gradient: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)', accent: '#FD1D1D', shadow: 'rgba(253,29,29,0.2)', hoverShadow: 'rgba(253,29,29,0.4)', hoverBorder: 'rgba(253,29,29,0.4)' },
              { name: 'GitHub', href: 'https://github.com/#', icon: Github, members: '3K Stars', action: 'Star', gradient: 'linear-gradient(135deg,#24292e,#57606a)', accent: '#8b949e', shadow: 'rgba(139,148,158,0.2)', hoverShadow: 'rgba(139,148,158,0.4)', hoverBorder: 'rgba(139,148,158,0.4)' },
              { name: 'X', href: 'https://x.com/#', icon: Twitter, members: '11K Followers', action: 'Follow', gradient: 'linear-gradient(135deg,#000000,#2f3336)', accent: '#e7e9ea', shadow: 'rgba(231,233,234,0.15)', hoverShadow: 'rgba(231,233,234,0.3)', hoverBorder: 'rgba(231,233,234,0.3)' },
              { name: 'Reddit', href: 'https://reddit.com/r/#', customIcon: RedditIcon, members: '6K Members', action: 'Join', gradient: 'linear-gradient(135deg,#FF4500,#CC3700)', accent: '#FF6534', shadow: 'rgba(255,69,0,0.2)', hoverShadow: 'rgba(255,69,0,0.4)', hoverBorder: 'rgba(255,69,0,0.4)' },
              { name: 'Threads', href: 'https://threads.net/#', customIcon: ThreadsIcon, members: '4K Followers', action: 'Follow', gradient: 'linear-gradient(135deg,#101010,#333333)', accent: '#e0e0e0', shadow: 'rgba(224,224,224,0.15)', hoverShadow: 'rgba(224,224,224,0.3)', hoverBorder: 'rgba(224,224,224,0.3)' },
              { name: 'Facebook', href: 'https://facebook.com/#', icon: Facebook, members: '18K Likes', action: 'Like', gradient: 'linear-gradient(135deg,#1877F2,#0C5FD4)', accent: '#4293FB', shadow: 'rgba(24,119,242,0.2)', hoverShadow: 'rgba(24,119,242,0.4)', hoverBorder: 'rgba(24,119,242,0.4)' },
              { name: 'Quora', href: 'https://quora.com/#', customIcon: QuoraIcon, members: '2K Followers', action: 'Follow', gradient: 'linear-gradient(135deg,#B92B27,#8E1F1C)', accent: '#E8352F', shadow: 'rgba(185,43,39,0.2)', hoverShadow: 'rgba(185,43,39,0.4)', hoverBorder: 'rgba(185,43,39,0.4)' },
            ].map((platform) => (
              <a key={platform.name} href={platform.href} target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl p-5 text-center transition-all duration-300 overflow-hidden hover:-translate-y-1"
                style={{ background: 'rgba(28,22,12,0.5)', border: '1px solid rgba(161,98,7,0.12)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = platform.hoverBorder; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(161,98,7,0.12)'; }}>
                <div className="relative">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                    style={{ background: platform.gradient, boxShadow: `0 8px 24px -4px ${platform.shadow}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${platform.hoverShadow}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px -4px ${platform.shadow}`; }}>
                    {platform.customIcon ? <platform.customIcon /> : <platform.icon className="w-7 h-7 text-white" />}
                  </div>
                  <div className="font-black text-sm mb-0.5" style={{ color: '#FFFBF0' }}>{platform.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: platform.accent }}>{platform.members}</div>
                  <div className="mt-2 text-[10px] flex items-center justify-center gap-1 transition-colors" style={{ color: '#6B5E4B' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = platform.accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6B5E4B'; }}>
                    {platform.action} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="max-w-2xl mx-auto rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
            style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.08), rgba(234,88,12,0.06), rgba(161,98,7,0.08))', border: '1px solid rgba(217,119,6,0.12)' }}>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-black text-lg mb-1" style={{ color: '#FFFBF0' }}>Stay in the Loop</h4>
              <p className="text-sm" style={{ color: '#A8977A' }}>Weekly insights, product updates & financial tips — no spam.</p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input type="email" placeholder="you@email.com" className="flex-1 sm:w-52 rounded-l-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(161,98,7,0.2)', borderRight: 'none', color: '#FFFBF0', placeholder: '#5C5040' }} />
              <button className="text-white font-bold px-5 py-2.5 rounded-r-xl transition-all text-sm whitespace-nowrap flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #D97706, #EA580C)', boxShadow: '0 8px 24px -8px rgba(234,88,12,0.3)' }}>
                <Mail className="w-4 h-4" /> Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" style={{ borderTop: '1px solid #1F1A12' }}>
          <p className="text-sm" style={{ color: '#6B5E4B' }}>
            © 2026 FinTrack. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <span style={{ color: '#6B5E4B' }}>🔒 Bank-level Security</span>
            <span style={{ color: '#4A3F32' }}>•</span>
            <span style={{ color: '#6B5E4B' }}>SOC 2 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
