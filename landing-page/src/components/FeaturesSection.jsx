import React, { useRef, useState, useEffect } from 'react';
import { Wallet, Target, TrendingUp, Bell, PieChart, Shield } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// --- 3D Tilt Card Component ---
const TiltCard = ({ feature, index }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the motion
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative group h-full cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        className="relative h-full p-8 rounded-3xl bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden transition-colors"
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
      >
        {/* Glow orb inside card */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

        <div style={{ transform: "translateZ(30px)" }}>
          <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <feature.icon className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div >
  );
};

export const FeaturesSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const rotateImage = useTransform(scrollYProgress, [0, 1], ["-5deg", "5deg"]);

  const features = [
    {
      icon: Wallet,
      title: 'Expense Tracking',
      description: 'Automatically categorize and track every expense with smart AI recognition algorithms.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Budget Planning',
      description: 'Create personalized budgets and get real-time alerts when you approach your spending limits.',
      color: 'from-teal-400 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations to optimize your spending and maximize savings potential.',
      color: 'from-orange-400 to-rose-500'
    },
    {
      icon: PieChart,
      title: 'Reports & Analytics',
      description: 'Visualize your financial health with beautiful, interactive 3D charts and comprehensive reports.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bell,
      title: 'Bill Reminders',
      description: 'Never miss a payment with automated bill reminders and recurring transaction tracking.',
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Financial Goals',
      description: 'Set and achieve savings goals with milestone tracking and dynamic progress visualization.',
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-32 relative overflow-hidden bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-500"
      style={{ perspective: "1200px" }}
    >
      {/* Decorative Animated Backgrounds */}
      <motion.div
        style={{ y: yBackground }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]) }}
        className="absolute bottom-0 left-[-20%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full filter blur-[100px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header content with 3D text reveal */}
        <div className="text-center mb-24 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 border border-blue-500/30 bg-blue-500/10 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              Next-Gen Capabilities
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            Everything You Need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400 inline-block pb-2">
              Master Your Money
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Explore our suite of professionally designed tools tailored to bring extreme clarity and power to your financial planning.
          </motion.p>
        </div>

        {/* 3D Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "1000px" }}>
          {features.map((feature, index) => (
            <TiltCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom Smart Analytics Showcase (Parallax 3D Setup) */}
        <div className="mt-40 grid lg:grid-cols-2 gap-16 items-center">

          {/* Image Side */}
          <motion.div
            style={{ rotateY: rotateImage, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, type: "spring" }}
            className="relative order-2 lg:order-1 perspective-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-3xl transform rotate-3 scale-105" style={{ transform: "translateZ(-30px)" }} />
            <img
              src="/analytic.jpg"
              alt="Futuristic Financial Dashboard Analytics"
              className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[450px] border border-gray-200/20 dark:border-gray-800/50"
              style={{ transform: "translateZ(30px)" }}
            />
            {/* Floating glass card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8 bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-xl z-20"
              style={{ transform: "translateZ(80px)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Savings</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">+24.5%</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Smart Analytics That
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">
                Work For You.
              </span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Our AI-powered engine deeply analyzes your spending patterns, identifies unique opportunities to save, and provides personalized wealth-building recommendations.
            </p>

            <div className="space-y-5">
              {[
                'Real-time automated expense categorization',
                'Predictive budget alerts & cash flow forecasting',
                'Fully customizable interactive financial models',
                'Instant multi-account synchronization'
              ].map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  key={index}
                  className="flex items-start space-x-4"
                >
                  <div className="w-6 h-6 mt-1 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
