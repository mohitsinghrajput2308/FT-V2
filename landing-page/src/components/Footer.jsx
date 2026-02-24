import React, { useState } from 'react';
import { Mail, MessageCircle, Send, Disc, Users, Globe, ArrowRight, Sparkles, Youtube, Linkedin, Github, Instagram, Facebook, Twitter } from 'lucide-react';

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.428 1.783 3.63 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.RecordSet-.586-.975 1.078-1.208 1.658-1.186 2.697-.112 4.647 2.58 4.964l-.228 2.026c-3.8-.428-6.227-3.1-5.91-7.186.256-3.296 2.543-5.392 5.94-5.392h.055c1.685 0 3.32.47 4.578 1.317 1.406.938 2.31 2.33 2.6 4.022.12.687.161 1.404.122 2.141-.044.828-.193 1.596-.441 2.32.59.514 1.05 1.128 1.378 1.828.78 1.688.756 4.084-.874 5.684-1.85 1.807-4.074 2.676-7.163 2.697z"/>
  </svg>
);

const QuoraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
    <path d="M12.005 0C5.373 0 0 5.372 0 12.003c0 6.63 5.372 12 12.005 12 6.63 0 12.002-5.37 12.002-12C24.007 5.372 18.635 0 12.005 0zm4.638 18.317c-.523-1.102-1.15-2.165-2.386-2.165-.276 0-.55.046-.806.138l-.458-1.1c.67-.441 1.598-.717 2.606-.717 1.7 0 2.845.826 3.637 2.017a6.45 6.45 0 0 1-2.593 1.827zm-4.63.72c-3.542 0-6.415-2.873-6.415-6.415 0-3.545 2.873-6.418 6.415-6.418 3.543 0 6.416 2.873 6.416 6.418 0 1.275-.375 2.465-1.017 3.463-.578-.793-1.319-1.441-2.408-1.441-.38 0-.76.082-1.12.22l.477 1.1a2.1 2.1 0 0 1 .645-.1c.586 0 1.052.302 1.452.773a6.46 6.46 0 0 1-4.045 1.4z"/>
  </svg>
);
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export const Footer = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
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
            <p className="text-xs italic" style={{ color: '#5C5040' }}>Built for dreamers. Designed for doers.</p>
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
