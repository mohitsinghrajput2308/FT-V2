import React from 'react';
import { Wallet, Target, TrendingUp, Bell, PieChart, Shield } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Expense Tracking',
      description: 'Automatically categorize and track every expense with smart AI recognition.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'Budget Planning',
      description: 'Create personalized budgets and get real-time alerts when you approach limits.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations to optimize your spending and maximize savings.',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: PieChart,
      title: 'Reports & Analytics',
      description: 'Visualize your financial health with beautiful charts and comprehensive reports.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Bell,
      title: 'Bill Reminders',
      description: 'Never miss a payment with automated bill reminders and recurring transaction tracking.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Financial Goals',
      description: 'Set and achieve savings goals with milestone tracking and progress visualization.',
      color: 'from-violet-500 to-violet-600'
    }
  ];

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors duration-500">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 dark:bg-teal-900/20 rounded-full filter blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">POWERFUL FEATURES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Master Your Money
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Powerful tools designed to give you complete control over your financial life
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer card-perspective bg-white dark:bg-gray-800/50"
              style={{
                transform: 'perspective(1000px) rotateY(0deg)',
                transition: 'all 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateZ(10px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
              }}
            >
              <CardContent className="p-8 relative">
                {/* Holographic overlay */}
                <div className="absolute inset-0 rounded-xl holographic opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                  <feature.icon className="w-8 h-8 text-white" />

                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlight Section */}
        <div className="mt-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
              alt="Financial Planning"
              className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Analytics That
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> Work For You</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Our AI-powered platform analyzes your spending patterns, identifies opportunities to save,
              and provides personalized recommendations to help you achieve your financial goals faster.
            </p>
            <ul className="space-y-4">
              {[
                'Real-time expense categorization',
                'Predictive budget alerts',
                'Customizable financial reports',
                'Multi-account synchronization'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
