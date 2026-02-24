import React from 'react';
import { UserPlus, Link as LinkIcon, LineChart, Rocket } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds with your email or social accounts. No credit card required.'
    },
    {
      icon: LinkIcon,
      step: '02',
      title: 'Connect Your Accounts',
      description: 'Securely link your bank accounts, credit cards, and financial institutions.'
    },
    {
      icon: LineChart,
      step: '03',
      title: 'Track & Analyze',
      description: 'Watch as FinTrack automatically categorizes expenses and generates insights.'
    },
    {
      icon: Rocket,
      step: '04',
      title: 'Achieve Your Goals',
      description: 'Follow personalized recommendations and reach your financial milestones faster.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-600">HOW IT WORKS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Started in
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> 4 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From signup to financial freedom in just a few minutes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-teal-200 to-cyan-200"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Step Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-200">
                {/* Step Number Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-6xl font-bold text-gray-100 -z-10">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 -right-4 z-20">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
