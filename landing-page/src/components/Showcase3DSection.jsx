import React from 'react';
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import { VIDEO_URLS } from '../config/videos';

export const Showcase3DSection = () => {
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const videoRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 10;
    const y = (clientY / innerHeight - 0.5) * -10;
    setMousePos({ x, y });
  };

  React.useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsVideoReady(true);
    }
  }, []);
  const stats = [
    {
      icon: TrendingUp,
      value: '2.5x',
      label: 'Faster Budgeting',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Secure & Encrypted',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      value: '<1s',
      label: 'Real-time Sync',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Globe,
      value: '150+',
      label: 'Countries Supported',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="py-24 bg-[#0A0A0B] relative overflow-hidden transition-colors duration-1000"
    >
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Shutter Layer (Fades Out) */}
        <div
          className={`absolute inset-0 bg-[#0A0A0B] z-10 transition-opacity duration-[1500ms] ease-in-out pointer-events-none ${isVideoReady ? 'opacity-0' : 'opacity-100'
            }`}
        />

        {/* Video Layer (Fades In) */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onPlaying={() => setIsVideoReady(true)}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-[1500ms] ease-in-out z-0 ${isVideoReady ? 'opacity-40' : 'opacity-0'
            }`}
          style={{
            filter: 'contrast(1.2) brightness(0.6) hue-rotate(-5deg)',
            willChange: 'opacity'
          }}
        >
          <source src={VIDEO_URLS.showcaseBg} type="video/mp4" />
        </video>

        {/* Depth & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B] z-5 opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-5 pointer-events-none" />
      </div>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powered by
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent neon-glow"> Cutting-Edge Technology</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of financial management with our advanced platform
          </p>
        </div>

        {/* 3D Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
              style={{
                animation: `float-3d 6s ease-in-out infinite`,
                animationDelay: `${index * 0.5}s`
              }}
            >
              <div
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-500"
                style={{
                  transform: 'perspective(1000px) rotateY(0deg)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) rotateX(5deg) translateZ(20px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
                }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Floating Dashboard Preview & Modules */}
        <div className="relative mt-20">

          {/* Floating Mini-Module 1: Alerts */}
          <div
            className="absolute -top-12 -left-4 lg:-left-20 w-48 h-32 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 animate-float-slow hidden lg:block"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.5}deg) translateZ(50px)`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">Smart Alert</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full w-full mb-2 overflow-hidden">
              <div className="h-full bg-orange-500 w-3/4"></div>
            </div>
            <p className="text-[10px] text-gray-400">Budget limit reached in "Dining Out" category</p>
          </div>

          {/* Floating Mini-Module 2: Insights */}
          <div
            className="absolute -bottom-10 -right-4 lg:-right-20 w-56 h-36 bg-blue-900/5 backdrop-blur-2xl border border-blue-500/20 rounded-2xl p-4 shadow-2xl z-20 animate-float-slow animation-delay-2000 hidden lg:block"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * -0.5}deg) translateZ(80px)`,
              boxShadow: '0 10px 40px rgba(0,10,40,0.5)'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">AI Insight</div>
                <div className="text-sm font-bold text-white">+12.5%</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">Your savings increased compared to last month. Keep it up!</p>
          </div>

          <div
            className="relative mx-auto max-w-5xl transition-transform duration-500 ease-out"
            style={{
              transform: `perspective(2000px) rotateX(${5 + mousePos.y}deg) rotateY(${mousePos.x}deg)`,
            }}
          >
            {/* Main screen container with deep glass effect */}
            <div className="relative bg-[#1A1D23]/40 rounded-3xl p-4 lg:p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] border border-white/5 backdrop-blur-md">
              <div className="bg-[#050505] rounded-2xl p-8 min-h-[450px] relative overflow-hidden border border-white/10">

                {/* Holographic Scanner Sweep */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-1/2 w-full -top-full animate-[scanner_4s_linear_infinite] z-10 pointer-events-none" />

                {/* Dashboard Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}></div>
                {/* Dashboard mockup content */}
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse"></div>
                      <span className="text-xl font-black text-white tracking-tighter">FinTrack <span className="text-blue-400">PRO</span></span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">Summary</div>
                      <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Analytics</div>
                    </div>
                  </div>

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

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-xs font-bold text-white uppercase tracking-widest">Market Performance</div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-[10px] text-gray-400">Income</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                          <span className="text-[10px] text-gray-400">Expense</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-48 bg-gradient-to-t from-blue-500/20 to-transparent rounded relative">
                      {/* Chart bars */}
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute bottom-0 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t"
                          style={{
                            left: `${i * 8.33}%`,
                            width: '6%',
                            height: `${Math.random() * 80 + 20}%`,
                            animation: `slide-up 1s ease-out forwards`,
                            animationDelay: `${i * 0.1}s`,
                            opacity: 0
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glowing particles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
              </div>
            </div>

            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes scanner {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}} />
    </section>
  );
};
