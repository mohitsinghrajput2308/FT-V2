import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useAuthModal } from '../context/AuthContext';

export const PricingSection = () => {
  const [yearly, setYearly] = useState(false);
  const { openRegister } = useAuthModal();

  const handlePlanClick = (plan) => {
    // All plan buttons open signup — paid users complete checkout after signing in
    openRegister();
  };

  const plans = [
    {
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started with basic finance tracking',
      features: [
        'Track up to 3 accounts',
        'Basic expense categorization',
        'Monthly reports',
        'Mobile app access',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Pro',
      monthlyPrice: 9.99,
      yearlyPrice: 7.99,
      description: 'Best for individuals serious about their finances',
      features: [
        'Unlimited accounts',
        'AI-powered insights',
        'Custom budgets & goals',
        'Bill reminders',
        'Priority support',
        'Export reports',
        'Multi-currency support'
      ],
      popular: true
    },
    {
      name: 'Business',
      monthlyPrice: 29.99,
      yearlyPrice: 24.99,
      description: 'Ideal for small businesses and teams',
      features: [
        'Everything in Pro',
        'Team collaboration (up to 5 users)',
        'Business expense tracking',
        'Tax preparation tools',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden transition-colors duration-500">
      {/* Background Decoration - enlarged */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-teal-100 dark:bg-teal-900/10 rounded-full filter blur-[120px] opacity-25"></div>
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-blue-100 dark:bg-blue-900/10 rounded-full filter blur-[120px] opacity-25"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">PRICING PLANS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose the Perfect Plan
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              For Your Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Start free, upgrade when you need more. Paid plans include a 14-day free trial — cancel anytime during the trial at no charge. All payments are final and non-refundable.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 gap-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                !yearly
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                yearly
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Yearly
              <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
            <Card
              key={index}
              className={`relative transform hover:-translate-y-2 transition-all duration-300 bg-white dark:bg-gray-800/50 ${plan.popular
                ? 'border-2 border-[#DAA520] shadow-[0_0_50px_rgba(218,165,32,0.15)] scale-105'
                : 'border-2 border-blue-200 dark:border-blue-900/50 hover:border-blue-500 dark:hover:border-blue-500 shadow-lg shadow-blue-500/5'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#DAA520] to-[#FFA500] text-black px-4 py-1 rounded-full text-sm font-black shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 h-12">{plan.description}</p>

                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">${price === 0 ? '0' : price.toFixed(2)}</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                {yearly && plan.monthlyPrice > 0 && (
                  <div className="mb-5 flex items-center gap-2">
                    <span className="line-through text-gray-400 text-sm">${plan.monthlyPrice.toFixed(2)}/mo</span>
                    <span className="text-green-500 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Save ${((plan.monthlyPrice - price) * 12).toFixed(0)}/yr</span>
                  </div>
                )}
                {!yearly && <div className="mb-5" />}

                <Button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-6 mb-8 shadow-lg transition-all duration-300 ${price !== 0
                    ? 'bg-gradient-to-r from-[#DAA520] to-[#FFA500] hover:from-[#B8860B] hover:to-[#FF8C00] text-black font-black shadow-orange-500/20'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold'
                    }`}
                >
                  {price === 0 ? 'Start Free' : 'Start 14-Day Trial'}
                </Button>

                {price !== 0 && (
                  <div className="relative group cursor-pointer mb-8">
                    {/* Outer Glow */}
                    <div className="absolute -inset-0.5 bg-orange-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    <div className="relative flex items-center justify-between p-5 bg-[#17191E] border border-[#B8860B]/40 rounded-[2rem] hover:border-[#B8860B]/80 transition-all duration-500 overflow-hidden shadow-2xl">
                      <div className="flex flex-col text-left relative z-10">
                        <span className="text-[11px] font-black text-[#DAA520] tracking-[0.25em] mb-2 italic">FAST-TRACK SYNC</span>
                        <div className="text-lg font-black text-white leading-[1.1] tracking-tight">
                          SKIP TRIAL & PAY<br />
                          NOW
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-4 relative z-10">
                        <div className="w-14 h-14 bg-[#FFA500] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,165,0,0.3)] group-hover:shadow-[0_0_40px_rgba(255,165,0,0.5)] transition-all duration-500">
                          <svg viewBox="0 0 24 24" className="w-7 h-7 text-black fill-current">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                        </div>
                      </div>

                      {/* Premium Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform duration-1000"></div>
                    </div>
                  </div>
                )}

                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? 'bg-orange-100 dark:bg-orange-900/30' : (plan.price !== '0' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700')
                        }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-orange-500 dark:text-orange-400' : (plan.price !== '0' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400')}`} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
          })}
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            🔒 Secure payments powered by Paddle • Cancel during trial, no charge • GST & taxes handled automatically • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
};
