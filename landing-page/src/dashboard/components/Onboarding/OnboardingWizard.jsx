import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Target, CheckCircle2, X, Sun, Moon, Monitor } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';

const steps = [
    { id: 'welcome',     title: 'Welcome to FinTrack', icon: CheckCircle2 },
    { id: 'transaction', title: 'First Transaction',    icon: PlusCircle },
    { id: 'budget',      title: 'Set a Budget',         icon: Target },
];

// Fallback categories for brand-new users who have no DB categories yet
const DEFAULT_EXPENSE_CATS = ['Food & Dining', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Utilities', 'Other'];
const DEFAULT_INCOME_CATS  = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

const THEME_OPTIONS = [
    { value: 'light',  label: 'Light',  Icon: Sun },
    { value: 'dark',   label: 'Dark',   Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
];

const OnboardingWizard = ({ onComplete }) => {
    const { updateSettings, addTransaction, addBudget, settings, categories } = useFinance();
    const { theme, setTheme } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    // Step 1 State
    const [currency, setCurrency] = useState(settings.currency || '$');

    // Step 2 State
    const [txAmount, setTxAmount] = useState('');
    const [txType, setTxType] = useState('expense');
    const [txCategory, setTxCategory] = useState('');
    const [txName, setTxName] = useState('');

    // Step 3 State
    const [budCategory, setBudCategory] = useState('');
    const [budLimit, setBudLimit] = useState('');

    // Available categories — fall back to built-in defaults for new users
    const expenseCategories = (categories.expense.length > 0 ? categories.expense.map(c => ({ value: c.name, label: c.name })) : DEFAULT_EXPENSE_CATS.map(c => ({ value: c, label: c })));
    const incomeCategories  = (categories.income.length  > 0 ? categories.income.map(c  => ({ value: c.name, label: c.name })) : DEFAULT_INCOME_CATS.map(c  => ({ value: c, label: c })));
    const displayCategories = txType === 'expense' ? expenseCategories : incomeCategories;

    // Dynamic currency prefix component for Input icons
    const CurrencyPrefix = () => <span className="text-sm font-semibold leading-none">{currency}</span>;

    const nextStep = () => {
        setDirection(1);
        if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
        else handleFinish();
    };

    const prevStep = () => {
        setDirection(-1);
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        // Save step 1 (always save currency)
        await updateSettings({ currency, onboarding_completed: true });

        // Save step 2 (if filled)
        if (txAmount && txCategory && txName) {
            await addTransaction({
                amount: parseFloat(txAmount),
                type: txType,
                category: txCategory,
                name: txName,
                date: new Date().toISOString().split('T')[0]
            });
        }

        // Save step 3 (if filled)
        if (budCategory && budLimit) {
            await addBudget({
                category: budCategory,
                limit: parseFloat(budLimit),
                spent: 0,
                color: '#3b82f6' // Default tailwind blue
            });
        }

        onComplete();
    };

    // Animation variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header elements with Progress */}
                <div className="p-6 pb-2 border-b border-gray-100 dark:border-dark-400 relative">
                    <button
                        onClick={handleSkip}
                        className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            const isPast = idx < currentStep;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                                        ${isActive ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-2 border-primary-500' :
                                            isPast ? 'bg-success-500 text-white' :
                                                'bg-gray-100 dark:bg-dark-300 text-gray-400'}`}
                                    >
                                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center hidden sm:block">
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden relative min-h-[300px]">
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-6"
                        >
                            {/* Step 1: Welcome, Currency & Theme */}
                            {currentStep === 0 && (
                                <div className="text-center space-y-6 pt-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Let's get your dashboard ready.
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Pick your currency and preferred look.
                                        </p>
                                    </div>

                                    {/* Currency */}
                                    <div className="max-w-xs mx-auto text-left">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Currency</label>
                                        <Select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            options={[
                                                { value: '$',  label: 'USD ($)' },
                                                { value: '€',  label: 'EUR (€)' },
                                                { value: '£',  label: 'GBP (£)' },
                                                { value: '₹',  label: 'INR (₹)' },
                                                { value: '¥',  label: 'JPY (¥)' },
                                                { value: 'A$', label: 'AUD (A$)' },
                                                { value: 'C$', label: 'CAD (C$)' },
                                                { value: 'CHF',label: 'CHF (CHF)' },
                                            ]}
                                        />
                                    </div>

                                    {/* Theme */}
                                    <div className="max-w-xs mx-auto text-left">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Theme</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {THEME_OPTIONS.map(({ value, label, Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setTheme(value)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200
                                                        ${theme === value
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                            : 'border-gray-200 dark:border-dark-400 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-dark-300'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: First Transaction */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Log your first transaction</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Add an expense or some recent income to see the charts come alive.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]}
                                            value={txType}
                                            onChange={(e) => { setTxType(e.target.value); setTxCategory(''); }}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            value={txAmount}
                                            onChange={(e) => setTxAmount(e.target.value)}
                                            icon={CurrencyPrefix}
                                        />
                                    </div>
                                    <Select
                                        placeholder="Select Category"
                                        options={displayCategories}
                                        value={txCategory}
                                        onChange={(e) => setTxCategory(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Description (e.g. Grocery store, Salary)"
                                        value={txName}
                                        onChange={(e) => setTxName(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Step 3: Set Budget */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set a goal for the month</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Create a budget limit for a category you want to monitor closely.</p>
                                    </div>
                                    <div className="space-y-4 mt-6">
                                        <Select
                                            placeholder="Select Category to Budget"
                                            options={expenseCategories}
                                            value={budCategory}
                                            onChange={(e) => setBudCategory(e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Monthly Limit"
                                            value={budLimit}
                                            onChange={(e) => setBudLimit(e.target.value)}
                                            icon={CurrencyPrefix}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 dark:border-dark-400 bg-gray-50 dark:bg-dark-300/30 flex justify-between items-center rounded-b-2xl">
                    <button
                        onClick={prevStep}
                        className={`text-sm font-medium px-4 py-2 ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        disabled={currentStep === 0}
                    >
                        Back
                    </button>

                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleSkip}>
                            Skip
                        </Button>
                        <Button variant="primary" onClick={nextStep}>
                            {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OnboardingWizard;
