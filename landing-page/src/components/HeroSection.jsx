import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Play, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { ParticleSystem } from './ParticleSystem';
import { useAuthModal } from '../context/AuthContext';
import { VIDEO_URLS } from '../config/videos';
import logo from '../assets/logo.png';
import cardBg from '../assets/card_final_bg.jpg';

export const HeroSection = () => {
  const { openRegister } = useAuthModal();
  const [isReady, setIsReady] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const videoRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // Max 10deg tilt
    const y = (clientY / innerHeight - 0.5) * -20;
    setMousePos({ x, y });
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaying = () => {
      // Small delay to ensure browser has painted the first frame
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    };

    video.addEventListener('playing', handlePlaying);
    if (video.readyState >= 3) handlePlaying();

    return () => video.removeEventListener('playing', handlePlaying);
  }, []);

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white dark:bg-[#0A0A0B]"
    >
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">

        {/* Shutter Layer (Fades Out) */}
        <div
          className={`absolute inset-0 bg-white dark:bg-[#0A0A0B] z-25 transition-opacity duration-[200ms] ease-in-out pointer-events-none ${isReady ? 'opacity-0' : 'opacity-100'
            }`}
          style={{ willChange: 'opacity' }}
        />

        {/* Video Layer (Fades In) */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute min-w-full min-h-full object-cover border-none transition-opacity duration-[200ms] ease-in-out z-0 ${isReady ? 'opacity-3 dark:opacity-60' : 'opacity-0'
            }`}
          style={{
            filter: 'contrast(1.05) brightness(1.05)',
            willChange: 'opacity'
          }}
        >
          <source src={VIDEO_URLS.heroBg} type="video/mp4" />
        </video>

        {/* Depth & Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A0A0B] via-transparent to-transparent opacity-100 pointer-events-none z-10" />
      </div>

      {/* Legacy Animated Background (Fallback/Accent) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-teal-50/50 dark:from-[#0A0A0B] dark:via-blue-900/10 dark:to-gray-950 transition-colors duration-500 -z-10">
        <div className="absolute inset-0 opacity-40 dark:opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-100 dark:bg-cyan-600 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Particle System */}
      <ParticleSystem />

      {/* Floating 3D Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-coin absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl animate-float-3d">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
        </div>
        <div className="floating-coin absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-2xl animate-float-3d animation-delay-2000">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
        </div>
        <div className="floating-coin absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-2xl animate-float-3d animation-delay-4000">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
        </div>

        {/* 3D Credit Card - Private Graphic Edition */}
        <div
          className="absolute top-[68%] right-0 md:right-2 lg:right-8 xl:right-12 w-80 h-48 hidden lg:block transition-transform duration-300 ease-out will-change-transform z-20"
          style={{
            transform: `perspective(1200px) rotateY(${mousePos.x - 18}deg) rotateX(${mousePos.y + 12}deg) rotateZ(-2deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Main Card Body */}
          <div className="relative w-full h-full rounded-[1.25rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden group">

            {/* Custom Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <img
                src={cardBg}
                alt="Card Background"
                className="w-full h-full object-cover brightness-110 contrast-115"
              />
              <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 transition-colors duration-500"></div>
            </div>

            {/* Shimmer Sweep Animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

            {/* Dynamic Glare Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
              style={{
                background: `radial-gradient(circle at ${50 + mousePos.x * 2}% ${50 + mousePos.y * 2}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
              }}
            />

            {/* Content Container */}
            <div className="relative z-10 h-full p-8 flex flex-col justify-between">

              {/* Header: Logo positioned top-right as per inspiration */}
              <div className="flex justify-end items-start text-right">
                <div className="group-hover:scale-110 transition-transform duration-500 ease-out relative">
                  {/* Dedicated Logo Glow */}
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <img
                    src={logo}
                    alt="FinTrack"
                    className="h-24 w-auto brightness-200 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] relative z-10"
                  />
                  <div className="text-[10px] text-white/60 tracking-[0.5em] uppercase mt-2 font-black relative z-10">Private Premier</div>
                </div>
              </div>

              {/* Middle Section: Secure Chip & Card Info */}
              <div className="flex items-center -mt-4">
                {/* Silver Secure Chip */}
                <div className="w-16 h-12 bg-gradient-to-br from-white via-gray-300 to-gray-500 rounded-lg shadow-inner relative overflow-hidden flex items-center justify-center border border-black/20">
                  <div className="absolute inset-0 opacity-10 grid grid-cols-2 grid-rows-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="border-b border-r border-black"></div>)}
                  </div>
                  <div className="w-9 h-7 border-[1px] border-black/10 rounded-sm"></div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="space-y-4">
                {/* Card Number (Bold High-Contrast Font) */}
                <div className="font-mono text-white text-[22px] font-bold tracking-[0.15em] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                  7280 <span className="opacity-40">9201</span> <span className="opacity-40">4434</span> 1092
                </div>

                {/* Holder Info */}
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black italic">Priority Client</div>
                    <div className="text-white font-black text-[12px] tracking-[0.2em] uppercase drop-shadow-md">MAXIMUS FINTRACK</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">Expires</div>
                    <div className="text-white font-mono text-[11px] font-bold">12 / 31</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6 animate-fade-in">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-600">
                #1 Finance Tracking App of 2026
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent neon-glow">
                Take Control
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">of Your Finances</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl animate-slide-up animation-delay-200">
              Track expenses, create budgets, and achieve your financial goals with AI-powered insights.
              Built to scale and designed to help 100,000+ users transform their financial future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up animation-delay-400">
              <Button
                onClick={openRegister}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-6 text-lg group shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in animation-delay-600">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">100K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">User Capacity</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">$500M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume Capacity</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Dashboard Preview */}
          <div className="relative animate-fade-in animation-delay-400">
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              {/* Main Dashboard Card with 3D effect */}
              <div
                className="card-perspective bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-gray-200 dark:border-gray-700"
                style={{
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3), 0 0 50px rgba(59, 130, 246, 0.3)'
                }}
              >
                <img
                  src="/hero-dashboard.jpg"
                  alt="Financial Dashboard"
                  className="rounded-xl w-full"
                />

                {/* Holographic overlay */}
                <div className="absolute inset-0 rounded-3xl holographic opacity-20 pointer-events-none"></div>
              </div>

              {/* Floating Stats Cards with 3D */}
              <div
                className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 animate-float-3d"
                style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <PiggyBank className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Savings</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">$24,580</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 animate-float-3d animation-delay-2000"
                style={{ transform: 'perspective(1000px) rotateY(10deg)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Budget</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">$3,200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};
