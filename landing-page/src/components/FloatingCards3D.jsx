import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, DollarSign, CreditCard, PiggyBank, Wallet, BarChart3 } from 'lucide-react';

export const FloatingCards3D = () => {
  const cards = [
    {
      icon: TrendingUp,
      title: 'Investment Growth',
      value: '+23.5%',
      subtitle: 'This Quarter',
      color: 'from-emerald-500 to-teal-500',
      delay: '0s'
    },
    {
      icon: DollarSign,
      title: 'Total Income',
      value: '$12,480',
      subtitle: 'This Month',
      color: 'from-blue-500 to-cyan-500',
      delay: '0.5s'
    },
    {
      icon: CreditCard,
      title: 'Credit Score',
      value: '785',
      subtitle: 'Excellent',
      color: 'from-violet-500 to-purple-500',
      delay: '1s'
    },
    {
      icon: PiggyBank,
      title: 'Savings Goal',
      value: '78%',
      subtitle: 'Complete',
      color: 'from-pink-500 to-rose-500',
      delay: '1.5s'
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cards.map((card, index) => (
        <div
          key={index}
          className="absolute animate-float-3d pointer-events-auto"
          style={{
            top: `${20 + (index * 20)}%`,
            left: index % 2 === 0 ? '5%' : 'auto',
            right: index % 2 === 1 ? '5%' : 'auto',
            animationDelay: card.delay,
            transform: 'perspective(1000px)'
          }}
        >
          <Card 
            className="w-64 border-2 border-white/20 backdrop-blur-xl bg-white/10 shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer"
            style={{
              transform: 'rotateY(-10deg) rotateX(5deg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <p className="text-sm opacity-80 mb-1">{card.title}</p>
                <p className="text-3xl font-bold mb-1">{card.value}</p>
                <p className="text-xs opacity-60">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
