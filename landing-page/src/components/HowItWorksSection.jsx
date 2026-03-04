import React, { useRef } from 'react';
import { UserPlus, Link as LinkIcon, LineChart, Rocket } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

const TiltStepCard = ({ step, index, total }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative group perspective-1000 z-10 w-full" style={{ perspective: "1000px" }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        className="relative h-full"
      >
        {/* Glowing Background Orb */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Card Body */}
        <div
          className="relative h-full bg-white/50 dark:bg-[#111827]/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 dark:border-gray-700/50 shadow-xl overflow-hidden text-center transition-colors"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >

          {/* Icon Container with 3D Pop */}
          <div className="relative mb-8 flex justify-center" style={{ transform: "translateZ(50px)" }}>
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <step.icon className="w-10 h-10 text-white drop-shadow-md" />
              <div className="absolute inset-0 rounded-2xl border-4 border-white/20" />
            </div>
          </div>

          <h3
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight"
            style={{ transform: "translateZ(30px)" }}
          >
            {step.title}
          </h3>
          <p
            className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm"
            style={{ transform: "translateZ(20px)" }}
          >
            {step.description}
          </p>
        </div>
      </motion.div>

      {/* Connection arrow between cards (hidden on mobile) */}
      {index < total - 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + (index * 0.1) }}
          className="hidden lg:flex absolute top-1/2 -right-6 z-20 transform -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};

export const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const steps = [
    {
      icon: UserPlus,
      step: '01',
      title: 'Create Account',
      description: 'Sign up securely in seconds. No credit card required to access our core features.'
    },
    {
      icon: LinkIcon,
      step: '02',
      title: 'Link Institutions',
      description: 'Connect your banks and credit cards securely using bank-grade 256-bit encryption.'
    },
    {
      icon: LineChart,
      step: '03',
      title: 'Track & Analyze',
      description: 'Watch as our AI automatically categorizes your transactions and builds rich insights.'
    },
    {
      icon: Rocket,
      step: '04',
      title: 'Achieve Freedom',
      description: 'Follow personalized growth recommendations and reach your financial goals faster.'
    }
  ];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-32 relative overflow-hidden bg-white dark:bg-[#0C0A07] transition-colors duration-500"
    >
      {/* 3D Animated Ambient Background Lines */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 flex"
      >
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-blue-400/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-t from-teal-400/20 to-transparent blur-3xl rounded-full" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        {/* Section Header */}
        <div className="text-center mb-24 relative flex flex-col items-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 border border-teal-500/30 bg-teal-500/10 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
              Seamless Onboarding
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Get Started in
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400">
              4 Simple Steps
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            From creating an account to complete financial clarity in under three minutes.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Animated Connecting Timeline Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="hidden lg:block absolute top-[160px] left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-500 origin-left z-0"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 w-full place-items-center">
            {steps.map((step, index) => (
              <TiltStepCard key={index} step={step} index={index} total={steps.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
