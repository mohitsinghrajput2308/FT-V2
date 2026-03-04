import React from 'react';
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import { VIDEO_URLS } from '../config/videos';
import { motion } from 'framer-motion';
import { ContainerScroll } from './ui/container-scroll-animation';

export const Showcase3DSection = () => {
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsVideoReady(true);
    }
    const fallbackTimer = setTimeout(() => setIsVideoReady(true), 3000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  const stats = [
    { icon: TrendingUp, value: '2.5x', label: 'Faster Budgeting', color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, value: '100%', label: 'Secure & Encrypted', color: 'from-emerald-500 to-teal-500' },
    { icon: Zap, value: '<1s', label: 'Real-time Sync', color: 'from-violet-500 to-purple-500' },
    { icon: Globe, value: '150+', label: 'Countries Supported', color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <section className="bg-[#0A0A0B] relative overflow-hidden transition-colors duration-1000">
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute inset-0 bg-[#0A0A0B] z-10 transition-opacity duration-[1500ms] ease-in-out pointer-events-none ${isVideoReady ? 'opacity-0' : 'opacity-100'}`} />
        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          onPlaying={() => setIsVideoReady(true)}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-[1500ms] ease-in-out z-0 ${isVideoReady ? 'opacity-40' : 'opacity-0'}`}
          style={{ filter: 'contrast(1.2) brightness(0.6) hue-rotate(-5deg)', willChange: 'opacity' }}
        >
          <source src={VIDEO_URLS.showcaseBg} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B] opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.3) 1px,transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      <div className="relative z-10">
        {/* Stats row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group"
                style={{ animation: `float-3d 6s ease-in-out infinite`, animationDelay: `${index * 0.5}s` }}
              >
                <div
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 cursor-pointer"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) rotateX(5deg) translateZ(20px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)'; }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ContainerScroll: dashboard tilts in on scroll */}
        <ContainerScroll
          titleComponent={
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 border border-blue-500/30 bg-blue-500/10 rounded-full mb-6 backdrop-blur-md"
              >
                <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Powered By</span>
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
                Cutting-Edge
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                  Technology
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Experience the future of financial management with our advanced platform
              </p>
            </div>
          }
        >
          {/* Dashboard mockup inside the ContainerScroll card */}
          <div className="relative w-full h-full bg-[#050505] rounded-2xl overflow-hidden p-8">
            {/* Holographic Scanner Sweep */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-1/2 w-full -top-full animate-[scanner_4s_linear_infinite] z-10 pointer-events-none" />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />

            <div className="space-y-6 relative z-10">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse" />
                  <span className="text-xl font-black text-white tracking-tighter">FinTrack <span className="text-blue-400">PRO</span></span>
                </div>
                <div className="flex space-x-2">
                  <div className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">Summary</div>
                  <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Analytics</div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Balance', value: '$84,250.00', trend: '+12%' },
                  { label: 'Monthly ROI', value: '$12,400.00', trend: '+5.4%' },
                  { label: 'Active Assets', value: '24', trend: 'Stable' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-xl font-black text-white mb-1">{item.value}</div>
                    <div className="text-[10px] font-bold text-blue-400">{item.trend} Since last month</div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-bold text-white uppercase tracking-widest">Market Performance</div>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-400">Income</span></div>
                    <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-cyan-400" /><span className="text-[10px] text-gray-400">Expense</span></div>
                  </div>
                </div>
                <div className="h-36 bg-gradient-to-t from-blue-500/20 to-transparent rounded relative">
                  {[65, 40, 80, 55, 90, 45, 70, 85, 50, 75, 60, 95].map((h, i) => (
                    <div key={i} className="absolute bottom-0 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t"
                      style={{ left: `${i * 8.33}%`, width: '5%', height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow particles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </ContainerScroll>
      </div>

      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes scanner {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>
    </section>
  );
};
