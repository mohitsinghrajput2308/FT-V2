import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Shield, TrendingUp, Zap, ChevronRight, DollarSign } from 'lucide-react';
import { useAuthModal } from '../context/AuthContext';
import { getVariant, getAbCopy, trackAbEvent, EXPERIMENTS } from '../utils/abTest';

export const CTASection = () => {
  const { openRegister } = useAuthModal();
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const ctaVariant = getVariant(EXPERIMENTS.CTA_BUTTON);
  const ctaLabel = getAbCopy(EXPERIMENTS.CTA_BUTTON, {
    A: 'Get Started Free',
    B: 'Start Tracking Free',
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    const section = sectionRef.current;
    if (section) section.addEventListener('mousemove', handleMouseMove);
    return () => { if (section) section.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  useEffect(() => {
    trackAbEvent(EXPERIMENTS.CTA_BUTTON, ctaVariant, 'impression');
  }, [ctaVariant]);

  const features = [
    { icon: Shield, label: 'Bank-grade security' },
    { icon: TrendingUp, label: 'Smart insights' },
    { icon: Zap, label: 'Real-time sync' },
    { icon: Sparkles, label: 'AI-powered' },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-32 relative overflow-hidden"
      style={{ background: '#0C0A07' }}
    >
      {/* Ambient warmth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 40%, rgba(217,119,6,0.18) 0%, transparent 75%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at ${mousePos.x}% ${mousePos.y}%, rgba(234,88,12,0.14) 0%, transparent 55%)`,
          transition: 'background 0.4s ease',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
          style={{
            background: 'rgba(161,98,7,0.12)',
            borderColor: 'rgba(161,98,7,0.30)',
          }}>
          <DollarSign className="w-4 h-4" style={{ color: '#FBBF24' }} />
          <span className="text-sm font-semibold tracking-wide" style={{ color: '#FBBF24' }}>
            Join 50,000+ smart savers
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span style={{ color: '#FFFBF0' }}>Stop Wondering.</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(to right, #F59E0B, #EA580C, #DC2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Start Growing.
          </span>
        </h2>

        {/* Sub-heading */}
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: '#A8977A' }}>
          Take control of your financial future with AI-powered tracking, real-time insights,
          and smart budgeting — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
              style={{
                background: 'rgba(28,22,12,0.60)',
                borderColor: 'rgba(161,98,7,0.20)',
                color: '#C9AA72',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: '#FBBF24' }} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={() => { trackAbEvent(EXPERIMENTS.CTA_BUTTON, ctaVariant, 'click'); openRegister(); }}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-900/40"
            style={{
              background: 'linear-gradient(135deg, #D97706, #EA580C)',
              color: '#FFFBF0',
              boxShadow: '0 8px 32px rgba(234,88,12,0.35)',
            }}
          >
            {ctaLabel}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold border transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(28,22,12,0.50)',
              borderColor: 'rgba(161,98,7,0.30)',
              color: '#C9AA72',
            }}
          >
            See how it works
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Trust row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Avatars */}
          <div className="flex -space-x-3">
            {['🧑‍💼','👩‍💻','🧑‍🎓','👨‍🍳','👩‍🔬'].map((emoji, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base"
                style={{
                  background: 'rgba(28,22,12,0.80)',
                  borderColor: 'rgba(161,98,7,0.40)',
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="text-sm" style={{ color: '#8A7A62' }}>
            <span style={{ color: '#FBBF24', fontWeight: 700 }}>50,000+</span> people already growing their wealth
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {['No credit card required', 'Free forever plan', '14-day free trial — cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: '#6B5E4B' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D97706' }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
    </section>
  );
};

export default CTASection;
