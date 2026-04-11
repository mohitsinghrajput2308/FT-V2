import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

const faqCategories = [
    {
        category: 'Account & Setup',
        icon: 'user',
        faqs: [
            {
                question: 'How do I update my profile information?',
                answer: 'Go to Profile in the dashboard. You can update your full name, phone, occupation, bio, profile picture, and security question. Your email and User ID are verified and cannot be changed. Profile updates sync instantly across the app.'
            },
            {
                question: 'How do I reset my password?',
                answer: 'Click "Forgot Password?" on the sign-in screen and enter your registered email. You\'ll receive a reset link — click it, set a new password, and you\'re back in. The link expires after a short time for security, so use it promptly. Check your spam folder if you don\'t see the email.'
            },
            {
                question: 'What happens if I delete my account?',
                answer: 'Deleting your account is permanent and irreversible. All your data including transactions, budgets, goals, investments, and settings will be permanently removed from our servers. Your account credentials will be deleted from auth. You\'ll need to create a new account to use FinTrack again.'
            },
            {
                question: 'How do I delete all my financial data but keep my account?',
                answer: 'Go to Settings > Data Management and click "Wipe All Data." This permanently deletes all your transactions, budgets, goals, investments, and bills while keeping your profile and settings intact. Use this to start fresh without deleting your account.'
            }
        ]
    },
    {
        category: 'Features & Usage',
        icon: 'features',
        faqs: [
            {
                question: 'How do I add a new transaction?',
                answer: 'Navigate to either the Income or Expenses page from the sidebar. Click the "Add Income" or "Add Expense" button to open a form where you can enter the transaction details including amount, category, date, and description.'
            },
            {
                question: 'How does the budget tracking work?',
                answer: 'Go to the Budgets page to set monthly spending limits for each expense category. The app automatically tracks your spending against these limits and shows progress bars with color-coded alerts — green for on-track, yellow for warning, and red for over budget.'
            },
            {
                question: 'How do I set up savings goals?',
                answer: 'Navigate to the Goals page and click "Add Goal." Enter a name, target amount, deadline, and priority. You can track progress over time and add money to your goals as you save toward each one.'
            },
            {
                question: 'How do bill reminders work?',
                answer: 'Add recurring bills in the Bills section with due dates. The app will show upcoming bills, highlight overdue ones in red, and let you mark them as paid. The notification badge in the navbar shows your pending bills count so you never miss a payment.'
            },
            {
                question: 'How do I track investments?',
                answer: 'Navigate to the Investments section and click "Add Investment." Enter the investment name, type (stock, mutual fund, bond, etc.), purchase amount, quantity, purchase date, and expected return rate. The dashboard shows total portfolio value, individual gains/losses, and performance analytics.'
            },
            {
                question: 'Can I create custom expense categories?',
                answer: 'Yes! Go to Settings > Categories to view built-in categories and create your own. Custom categories help you organize spending the way that makes sense for you. You can edit, reorder, or hide categories anytime.'
            }
        ]
    },
    {
        category: 'Reports & Export',
        icon: 'export',
        faqs: [
            {
                question: 'Can I download my financial reports?',
                answer: 'Yes! Go to Reports and click "Export as PDF." This generates a professional report with your income, expenses, savings trends, budget breakdown, and financial health score. You can also export transaction data as CSV for spreadsheets.'
            },
            {
                question: 'Can I export my financial data?',
                answer: 'Yes! Go to Settings > Data Management and click "Export Data (JSON)" to download all your data. You can also export transactions as CSV from the Transactions page for use in spreadsheet applications like Excel or Google Sheets.'
            }
        ]
    },
    {
        category: 'Settings & Preferences',
        icon: 'settings',
        faqs: [
            {
                question: 'How do I change the currency or date format?',
                answer: 'Go to Settings and you\'ll find options to change your preferred currency ($, €, £, ₹, and more). These changes are applied throughout the app immediately after saving and affect all transaction displays and calculations.'
            },
            {
                question: 'What are the financial calculators?',
                answer: 'The Calculators page includes three tools: EMI Calculator (loan payment breakdowns), SIP Calculator (systematic investment returns), and Retirement Planner (long-term corpus planning). Each provides instant results with visual growth projections.'
            }
        ]
    },
    {
        category: 'Two-Factor Authentication (2FA)',
        icon: 'lock',
        faqs: [
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
            }
        ]
    },
    {
        category: 'Security & Privacy',
        icon: 'shield',
        faqs: [
            {
                question: 'Is my data secure?',
                answer: 'Yes. Your data is protected with industry-standard encryption (AES-256 at rest, TLS 1.3 in transit). Passwords are hashed and never stored in plain text. With 2FA enabled, even if someone gets your password, they can\'t access your account without your authenticator code. Row Level Security ensures you can only access your own data.'
            }
        ]
    },
    {
        category: 'Billing & Support',
        icon: 'help',
        faqs: [
            {
                question: 'What subscription plans are available?',
                answer: 'FinTrack offers three plans: Free (50 transactions max, 3 investments, budgets, goals, basic reports), Pro ($9.99/month with unlimited transactions, advanced analytics, custom categories, priority support, unlimited exports, investment tracking), and Business ($29.99/month with team members, API access, custom integrations, and dedicated account manager). All plans include AES-256 encryption and 2FA security.'
            },
            {
                question: 'What features are included in each plan?',
                answer: 'Free: 50 transactions max, income/expense tracking, 3 investments, 2 budgets/goals/bills, 2FA, basic reports. Pro: Everything in Free plus unlimited transactions, unlimited investments, EMI/SIP/Retirement calculators, investment portfolio tracking, batch imports/exports (CSV, JSON), monthly PDF reports, priority email support, 5 budgets/goals/bills. Business: Everything in Pro plus 5+ team members, custom integrations via API, Webhook support, unlimited budgets/goals/bills, dedicated account manager.'
            },
            {
                question: 'Can I upgrade or downgrade my plan anytime?',
                answer: 'Yes! You can change your plan anytime from Settings > Subscription. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle. If you downgrade mid-cycle, you\'ll get a prorated credit applied to your next invoice. No cancellation fees or hidden charges.'
            },
            {
                question: 'Is there a free trial for Pro or Business?',
                answer: 'Yes! Pro and Business plans come with a 7-day free trial with full access to all features. No credit card required to start the trial. You\'ll be prompted to add a payment method only after the trial ends. Cancel anytime during the trial and you won\'t be charged.'
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) via Paddle. Paddle supports 100+ payment methods globally including local payment options in your region. All transactions are encrypted and PCI-DSS compliant. Your billing information is securely processed and never stored in plain text on our servers.'
            },
            {
                question: 'Do you offer refunds?',
                answer: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re unhappy for any reason, contact our support team within 14 days of your first purchase and we\'ll issue a full refund, no questions asked. After 14 days, refunds may be available case-by-case depending on circumstances.'
            },
            {
                question: 'Can I cancel my subscription?',
                answer: 'Yes, you can cancel anytime from Settings > Subscription > Cancel Plan. Cancellations take effect at the end of your current billing cycle, so you\'ll retain Pro/Business features until then. You\'ll still have access to your data on the Free plan after cancellation. Your data is never deleted unless you explicitly delete your account.'
            },
            {
                question: 'How do I contact support?',
                answer: 'Navigate to Help > Contact Support to submit your question or issue directly. Fill in your name (auto-populated if signed in), email, and message. Our support team typically responds within 24 hours for Free users and within 2 hours for Pro/Business users (during business hours). You can also check our documentation or FAQ for instant answers.'
            }
        ]
    }
];



const Help = () => {
    const { success, error, warning } = useNotification();
    const { currentUser } = useAuth();
    const [openFaq, setOpenFaq] = useState(null);
    const [openCategories, setOpenCategories] = useState(
        faqCategories.reduce((acc, _, idx) => ({ ...acc, [idx]: false }), {})
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactLoading, setContactLoading] = useState(false);
    const [contactError, setContactError] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        setContactForm(prev => ({
            ...prev,
            name: prev.name || (currentUser.full_name || currentUser.name || currentUser.username || ''),
            email: prev.email || (currentUser.email || ''),
        }));
    }, [currentUser]);

    const filteredFaqCategories = faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.faqs.length > 0);

    const toggleCategory = (catIndex) => {
        setOpenCategories(prev => ({
            ...prev,
            [catIndex]: !prev[catIndex]
        }));
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
            warning('Please fill in all fields');
            return;
        }
        setContactLoading(true);
        setContactError('');
        try {
            const nameToSend = currentUser ? (currentUser.full_name || currentUser.name || currentUser.username || '') : contactForm.name.trim();
            const emailToSend = currentUser ? (currentUser.email || '') : contactForm.email.trim().toLowerCase();

            const { error: dbError } = await supabase
                .from('contact_submissions')
                .insert({
                    name: nameToSend,
                    email: emailToSend,
                    message: contactForm.message.trim(),
                });
            if (dbError) throw dbError;
            success('Thank you! Your message has been sent. We\'ll get back to you soon.');
            setContactForm({ name: '', email: '', message: '' });
        } catch (err) {
            setContactError('Failed to send message. Please try again.');
            error('Failed to send message');
        }
        setContactLoading(false);
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

            {/* FAQs by Category */}
            {filteredFaqCategories.length > 0 ? (
                <div className="space-y-3">
                    {filteredFaqCategories.map((category, catIndex) => (
                        <Card key={catIndex}>
                        {/* Category Header - Collapsible */}
                        <button
                            onClick={() => toggleCategory(catIndex)}
                            className="w-full flex items-center justify-between p-4 -m-4 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors rounded-lg"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 text-white flex items-center justify-center text-xs font-bold">
                                    {catIndex + 1}
                                </span>
                                {category.category}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    ({category.faqs.length})
                                </span>
                            </h3>
                            {openCategories[catIndex] ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                        </button>

                        {/* Category Content - Collapsible */}
                        {openCategories[catIndex] && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-300 space-y-2">
                                {category.faqs.map((faq, faqIndex) => {
                                    const uniqueFaqIndex = `${catIndex}-${faqIndex}`;
                                    return (
                                        <div
                                            key={faqIndex}
                                            className="border border-gray-200 dark:border-dark-300 rounded-lg overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setOpenFaq(openFaq === uniqueFaqIndex ? null : uniqueFaqIndex)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                                                {openFaq === uniqueFaqIndex ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>
                                            {openFaq === uniqueFaqIndex && (
                                                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-dark-400">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <p className="text-center py-8 text-gray-400">No matching questions found</p>
                </Card>
            )}

            {/* Contact Form */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Support
                </h3>
                <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
                    {currentUser ? (
                        <>
                            <Input
                                label="Your Name"
                                placeholder="Enter your name"
                                value={currentUser.full_name || currentUser.name || currentUser.username || ''}
                                readOnly
                                className="bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:border-primary-500 focus:ring-primary-500/20 cursor-text"
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={currentUser.email || ''}
                                readOnly
                                className="bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400 hover:border-primary-500 focus:ring-primary-500/20 cursor-text"
                            />
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
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
                    {contactError && (
                        <p className="text-sm text-danger-600 dark:text-danger-400">{contactError}</p>
                    )}
                    <Button type="submit" icon={contactLoading ? Loader2 : Send} loading={contactLoading} disabled={contactLoading}>
                        {contactLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>
            </Card>

            {/* Quick Links removed per request */}
        </div>
    );
};

export default Help;
