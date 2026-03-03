import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { useAuthModal } from '../context/AuthContext';

const faqs = [
  {
    category: 'Account & Setup',
    items: [
      {
        question: 'How do I create an account on FinTrack?',
        answer: 'Click the "Get Started" or "Sign Up" button on the homepage. You\'ll need to provide a username, email address, and password. During registration, you\'ll also select a security question and provide an answer — this is used for account recovery, so pick something you\'ll remember. Once submitted, check your email for a verification link to activate your account.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password?" on the sign-in screen. Enter the email address you registered with, and we\'ll send you a password reset link. Check your inbox (and spam folder) for the email. Click the link, set a new password, and you\'re back in. The reset link expires after a short time for security, so use it promptly.'
      },
      {
        question: 'Can I use FinTrack on multiple devices?',
        answer: 'Absolutely. Since FinTrack is a web application, you can access it from any device with a browser — desktop, laptop, tablet, or phone. Your data syncs automatically through the cloud. Just sign in with your credentials and complete 2FA verification if enabled. For the best experience on mobile, add the site to your home screen for quick access.'
      },
      {
        question: 'I\'m getting an error when trying to sign in. What should I do?',
        answer: 'First, double-check that your email and password are correct (watch out for caps lock). If you\'ve forgotten your password, use the "Forgot Password?" link to reset it. If you have 2FA enabled, make sure you\'re entering the code from the correct authenticator entry labeled "Fin Track." If the problem persists, try clearing your browser cache or using a different browser. You can also reach out to our support team for help.'
      },
    ]
  },
  {
    category: 'Two-Factor Authentication (2FA)',
    items: [
      {
        question: 'What is Two-Factor Authentication (2FA) and why should I enable it?',
        answer: '2FA adds an extra layer of security to your account. After entering your password, you\'ll also need to enter a 6-digit code from an authenticator app on your phone. Even if someone steals your password, they can\'t access your account without your phone. We strongly recommend enabling 2FA to keep your financial data safe.'
      },
      {
        question: 'How do I set up 2FA on my account?',
        answer: 'After signing in, go to your account settings or enable it during login when prompted. FinTrack will display a QR code — open your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator), tap the "+" icon, and scan the QR code. The app will start generating 6-digit codes. Enter the current code to complete the setup. Make sure to save your recovery options before finishing.'
      },
      {
        question: 'Which authenticator apps work with FinTrack?',
        answer: 'FinTrack works with any TOTP-based authenticator app. Popular choices include Google Authenticator, Microsoft Authenticator, Authy, 1Password, and Bitwarden. All of these are free and available on both iOS and Android. We recommend Authy if you want cloud backup of your codes across devices.'
      },
      {
        question: 'The QR code isn\'t scanning. What should I do?',
        answer: 'First, make sure your phone camera is focused and the screen brightness is turned up. Try increasing the size of the QR code by zooming in on your browser. If it still doesn\'t work, most authenticator apps have a "Manual Entry" or "Enter key manually" option — look for the secret key displayed below the QR code and type it in directly. Also make sure your authenticator app is up to date.'
      },
      {
        question: 'My 2FA code says "invalid" even though I\'m entering it correctly. What\'s wrong?',
        answer: 'TOTP codes are time-sensitive and change every 30 seconds. The most common cause is your phone\'s clock being out of sync. Go to your phone\'s Date & Time settings and enable "Set time automatically" or "Use network time." Also, make sure you\'re entering the code for "Fin Track" in your authenticator app (not a code from a different service). If the code just changed, wait for the next one and enter it quickly.'
      },
      {
        question: 'I lost my phone or deleted my authenticator app. How do I recover my account?',
        answer: 'Don\'t panic — you can recover your account. On the 2FA verification screen, click "Lost access to your authenticator?" and then "Set up another 2FA." You\'ll be asked to verify your identity by answering the security question you set during registration. Once verified, your old authenticator will be permanently removed and you\'ll be guided through setting up a new one. Make sure you remember your security question and answer.'
      },
      {
        question: 'What happens to my old authenticator when I set up a new one?',
        answer: 'When you go through the 2FA recovery process, your previous authenticator is permanently removed from your account. The old codes will stop working immediately. You\'ll need to complete the new setup by scanning a fresh QR code. There\'s no way to restore the old authenticator after recovery, so make sure the new one is set up completely before closing the setup screen.'
      },
    ]
  },
  {
    category: 'Security & Privacy',
    items: [
      {
        question: 'Is my financial data safe with FinTrack?',
        answer: 'Yes. We use industry-standard encryption to protect all your data in transit and at rest. Your passwords are hashed and never stored in plain text. With 2FA enabled, your account has an additional security layer that prevents unauthorized access even if your password is compromised. We also support Row Level Security on our database, meaning users can only access their own data — not anyone else\'s.'
      },
      {
        question: 'What is the security question for and can I change it?',
        answer: 'Your security question is used to verify your identity if you ever need to recover your 2FA access. It\'s set during registration and acts as a backup to prove you\'re the real account owner. Choose a question whose answer you\'ll always remember but others can\'t easily guess. You can also write your own custom security question for extra protection.'
      },
    ]
  },
  {
    category: 'Features & Usage',
    items: [
      {
        question: 'How do I track my income and expenses?',
        answer: 'Once logged in, use the dashboard sidebar to navigate to Income or Expenses. Click "Add Income" or "Add Expense" to log a new transaction with the amount, category, date, and an optional description. FinTrack automatically categorizes your spending and shows visual breakdowns through charts and graphs so you can see exactly where your money goes each month.'
      },
      {
        question: 'Can I set budgets and savings goals?',
        answer: 'Yes! Head to the Budgets section to set monthly spending limits for categories like food, transport, entertainment, and more. You\'ll see color-coded progress bars showing how close you are to each limit. For savings, go to the Goals page to create targets with deadlines — like saving for a vacation or emergency fund — and track your progress over time.'
      },
      {
        question: 'Can I export my financial data?',
        answer: 'Yes. Go to Settings > Data Management in your dashboard and click "Export Data." You can download your transactions, budgets, and goals as JSON or CSV files. CSV exports work great with Excel or Google Sheets for further analysis. We recommend exporting your data regularly as a backup.'
      },
    ]
  },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Flatten and filter FAQs based on search
  const filteredCategories = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        !searchQuery ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const totalResults = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  const { modalState, closeModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-teal-600/8 rounded-full blur-[100px]"
        />
      </div>
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10">
        {/* Hero Header */}
        <section className="pt-40 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:-rotate-12 transition-transform duration-500">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-extrabold mb-4"
            >
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
            >
              Everything you need to know about FinTrack — from setting up your account to securing it with 2FA.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-base"
                />
                {searchQuery && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {totalResults} result{totalResults !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredCategories.map((category, catIdx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * catIdx + 0.5 }}
              >
                {/* Category Header */}
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === catIdx ? null : catIdx
                    )
                  }
                  className="w-full flex items-center justify-between mb-4 group"
                >
                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {category.category}
                    <span className="ml-3 text-sm font-normal text-gray-500">
                      ({category.items.length} question{category.items.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-all duration-300 ${
                      expandedCategory === catIdx || searchQuery ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Category Items — expanded by default when searching, or when toggled */}
                {(expandedCategory === catIdx || searchQuery) && (
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.items.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`cat-${catIdx}-item-${index}`}
                        className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] px-6 hover:border-blue-500/20 transition-all duration-300"
                      >
                        <AccordionTrigger className="text-left text-base font-semibold text-gray-200 hover:text-blue-400 py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-400 pb-5 leading-relaxed text-[15px]">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </motion.div>
            ))}

            {filteredCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No questions match your search.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Still have questions */}
        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-white/[0.06]"
            >
              <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-gray-400 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a
                href="mailto:support@fintrack.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20"
              >
                Contact Support
              </a>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
      <AuthModal isOpen={modalState.isOpen} onClose={closeModal} initialView={modalState.view} />
    </div>
  );
};

export default FAQ;
