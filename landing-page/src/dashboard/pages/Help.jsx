import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Send, Book, Video, MessageCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

const faqs = [
    {
        question: 'How do I add a new transaction?',
        answer: 'Navigate to either the Income or Expenses page from the sidebar. Click the "Add Income" or "Add Expense" button to open a form where you can enter the transaction details including amount, category, date, and description.'
    },
    {
        question: 'How does the budget tracking work?',
        answer: 'Go to the Budgets page to set monthly spending limits for each expense category. The app automatically tracks your spending against these limits and shows progress bars with color-coded alerts — green for on-track, yellow for warning, and red for over budget.'
    },
    {
        question: 'Can I export my financial data?',
        answer: 'Yes! Go to Settings > Data Management and click "Export Data (JSON)" to download all your data. You can also export transactions as CSV from the Transactions page for use in spreadsheet applications like Excel or Google Sheets.'
    },
    {
        question: 'How do I set up savings goals?',
        answer: 'Navigate to the Goals page and click "Add Goal." Enter a name, target amount, deadline, and priority. You can track progress over time and add money to your goals as you save toward each one.'
    },
    {
        question: 'How do I enable or set up Two-Factor Authentication (2FA)?',
        answer: 'Go to your account settings and look for the 2FA / Security section. Click "Enable 2FA" and you\'ll see a QR code. Open your authenticator app (Google Authenticator, Authy, etc.), scan the QR code, and enter the 6-digit code displayed to complete the setup. This adds an extra layer of protection to your account.'
    },
    {
        question: 'I lost access to my authenticator app. How do I get back into my account?',
        answer: 'On the 2FA verification screen, click "Lost access to your authenticator?" then "Set up another 2FA." You\'ll need to verify your identity by answering the security question you chose during registration. Once verified, your old authenticator is permanently removed and you\'ll set up a new one with a fresh QR code.'
    },
    {
        question: 'My 2FA code keeps saying "invalid." What should I do?',
        answer: 'TOTP codes are time-sensitive and change every 30 seconds. The most common cause is your phone clock being out of sync. Go to your phone\'s Date & Time settings and enable "Set time automatically." Also, make sure you\'re entering the code for "Fin Track" in your authenticator app — not a code from a different service.'
    },
    {
        question: 'How do I change the currency or date format?',
        answer: 'Go to Settings and you\'ll find options to change your preferred currency ($, €, £, ₹) and date format. These changes are applied throughout the app immediately after saving.'
    },
    {
        question: 'What are the financial calculators?',
        answer: 'The Calculators page includes three tools: EMI Calculator for loan payments, SIP Calculator for systematic investment returns, and Compound Interest Calculator for investment growth projections. Each calculator provides instant results with visual breakdowns.'
    },
    {
        question: 'How do bill reminders work?',
        answer: 'Add recurring bills in the Bills section with due dates. The app will show upcoming bills, highlight overdue ones in red, and let you mark them as paid. The notification badge in the navbar shows your pending bills count so you never miss a payment.'
    },
    {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password?" on the sign-in screen and enter your registered email. You\'ll receive a reset link — click it, set a new password, and you\'re back in. The link expires after a short time for security, so use it promptly. Check your spam folder if you don\'t see the email.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes. Your data is protected with industry-standard encryption. Passwords are hashed and never stored in plain text. With 2FA enabled, even if someone gets your password, they can\'t access your account without your authenticator code. Row Level Security ensures you can only access your own data.'
    }
];

const guides = [
    { title: 'Getting Started', icon: Book, description: 'Learn the basics of using FinanceTracker' },
    { title: 'Managing Transactions', icon: Book, description: 'Add, edit, and organize your transactions' },
    { title: 'Setting Budgets', icon: Book, description: 'Create and track monthly budgets' },
    { title: 'Investment Tracking', icon: Book, description: 'Monitor your investment portfolio' },
    { title: 'Video Tutorials', icon: Video, description: 'Watch step-by-step video guides' }
];

const Help = () => {
    const { success } = useNotification();
    const [openFaq, setOpenFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

    const filteredFaqs = faqs.filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContactSubmit = (e) => {
        e.preventDefault();
        if (contactForm.name && contactForm.email && contactForm.message) {
            success('Thank you! Your message has been sent. We\'ll get back to you soon.');
            setContactForm({ name: '', email: '', message: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
                <p className="text-gray-500 dark:text-gray-400">Find answers and get help</p>
            </div>

            {/* Search */}
            <Card>
                <Input
                    placeholder="Search FAQs..."
                    icon={Search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* FAQs */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 dark:border-dark-300 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                                {openFaq === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>
                            {openFaq === index && (
                                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredFaqs.length === 0 && (
                        <p className="text-center py-4 text-gray-400">No matching questions found</p>
                    )}
                </div>
            </Card>

            {/* Guides */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    How-to Guides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guides.map((guide, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <guide.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{guide.title}</h4>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{guide.description}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Contact Form */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Support
                </h3>
                <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
                    <Input
                        label="Your Name"
                        placeholder="Enter your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            rows={4}
                            placeholder="Describe your issue or question..."
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            required
                        />
                    </div>
                    <Button type="submit" icon={Send}>
                        Send Message
                    </Button>
                </form>
            </Card>

            {/* Quick Links */}
            <Card className="bg-gradient-to-r from-primary-500 to-success-500 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Need more help?</h3>
                        <p className="text-primary-100">
                            Check out our documentation or reach out to our support team.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Help;
