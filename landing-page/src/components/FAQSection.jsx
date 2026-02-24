import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export const FAQSection = () => {
  const faqs = [
    {
      question: 'How do I create an account on FinTrack?',
      answer: 'Click the "Get Started" or "Sign Up" button on the homepage. You\'ll need to provide a username, email address, and password. During registration, you\'ll also select a security question and provide an answer — this is used for account recovery, so pick something you\'ll remember. Once submitted, check your email for a verification link to activate your account.'
    },
    {
      question: 'What is Two-Factor Authentication (2FA) and why should I enable it?',
      answer: '2FA adds an extra layer of security to your account. After entering your password, you\'ll also need to enter a 6-digit code from an authenticator app on your phone. Even if someone steals your password, they can\'t access your account without your phone. We strongly recommend enabling 2FA to keep your financial data safe.'
    },
    {
      question: 'How do I set up 2FA on my account?',
      answer: 'After signing in, go to your account settings or enable it during login when prompted. FinTrack will display a QR code — open your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator), tap the "+" icon, and scan the QR code. The app will start generating 6-digit codes. Enter the current code to complete the setup. Make sure to save your recovery options before finishing.'
    },
    {
      question: 'The QR code isn\'t scanning. What should I do?',
      answer: 'First, make sure your phone camera is focused and the screen brightness is turned up. Try increasing the size of the QR code by zooming in on your browser. If it still doesn\'t work, most authenticator apps have a "Manual Entry" or "Enter key manually" option — look for the secret key displayed below the QR code and type it in directly. Also make sure your authenticator app is up to date.'
    },
    {
      question: 'Which authenticator apps work with FinTrack?',
      answer: 'FinTrack works with any TOTP-based authenticator app. Popular choices include Google Authenticator, Microsoft Authenticator, Authy, 1Password, and Bitwarden. All of these are free and available on both iOS and Android. We recommend Authy if you want cloud backup of your codes across devices.'
    },
    {
      question: 'I lost my phone or deleted my authenticator app. How do I recover my account?',
      answer: 'Don\'t panic — you can recover your account. On the 2FA verification screen, click "Lost access to your authenticator?" and then "Set up another 2FA." You\'ll be asked to verify your identity by answering the security question you set during registration. Once verified, your old authenticator will be permanently removed and you\'ll be guided through setting up a new one. Make sure you remember your security question and answer.'
    },
    {
      question: 'What happens to my old authenticator when I set up a new one?',
      answer: 'When you go through the 2FA recovery process, your previous authenticator is permanently removed from your account. The old codes will stop working immediately. You\'ll need to complete the new setup by scanning a fresh QR code. There\'s no way to restore the old authenticator after recovery, so make sure the new one is set up completely before closing the setup screen.'
    },
    {
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password?" on the sign-in screen. Enter the email address you registered with, and we\'ll send you a password reset link. Check your inbox (and spam folder) for the email. Click the link, set a new password, and you\'re back in. The reset link expires after a short time for security, so use it promptly.'
    },
    {
      question: 'What is the security question for and can I change it?',
      answer: 'Your security question is used to verify your identity if you ever need to recover your 2FA access. It\'s set during registration and acts as a backup to prove you\'re the real account owner. Choose a question whose answer you\'ll always remember but others can\'t easily guess. You can also write your own custom security question for extra protection.'
    },
    {
      question: 'Is my financial data safe with FinTrack?',
      answer: 'Yes. We use industry-standard encryption to protect all your data in transit and at rest. Your passwords are hashed and never stored in plain text. With 2FA enabled, your account has an additional security layer that prevents unauthorized access even if your password is compromised. We also support Row Level Security on our database, meaning users can only access their own data — not anyone else\'s.'
    },
    {
      question: 'Can I use FinTrack on multiple devices?',
      answer: 'Absolutely. Since FinTrack is a web application, you can access it from any device with a browser — desktop, laptop, tablet, or phone. Your data syncs automatically through the cloud. Just sign in with your credentials and complete 2FA verification if enabled. For the best experience on mobile, add the site to your home screen for quick access.'
    },
    {
      question: 'My 2FA code says "invalid" even though I\'m entering it correctly. What\'s wrong?',
      answer: 'TOTP codes are time-sensitive and change every 30 seconds. The most common cause is your phone\'s clock being out of sync. Go to your phone\'s Date & Time settings and enable "Set time automatically" or "Use network time." Also, make sure you\'re entering the code for "Fin Track" in your authenticator app (not a code from a different service). If the code just changed, wait for the next one and enter it quickly.'
    },
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
    {
      question: 'I\'m getting an error when trying to sign in. What should I do?',
      answer: 'First, double-check that your email and password are correct (watch out for caps lock). If you\'ve forgotten your password, use the "Forgot Password?" link to reset it. If you have 2FA enabled, make sure you\'re entering the code from the correct authenticator entry labeled "Fin Track." If the problem persists, try clearing your browser cache or using a different browser. You can also reach out to our support team for help.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-950 dark:to-gray-900 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Got questions? We've got answers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border-2 border-gray-100 dark:border-gray-700 px-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still Have Questions CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Still have questions?</p>
          <a
            href="mailto:support@fintrack.com"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};
