import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, groupByCategory, getShortMonthName } from '../utils/helpers';
import SummaryCard from '../components/Dashboard/SummaryCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import QuickActions from '../components/Dashboard/QuickActions';
import BudgetOverview from '../components/Dashboard/BudgetOverview';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import OnboardingWizard from '../components/Onboarding/OnboardingWizard';

const Dashboard = () => {
    const [wizardDone, setWizardDone] = useState(false);
    const {
        transactions,
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        totalSavings,
        currency,
        settings
    } = useFinance();

    // Calculate expense data for pie chart
    const currentMonthExpenses = transactions.filter(
        t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7))
    );
    const expenseByCategory = groupByCategory(currentMonthExpenses);
    const pieChartData = Object.entries(expenseByCategory).map(([name, data]) => ({
        name,
        value: data.total
    }));

    // Calculate last 6 months data for comparison
    const lastMonthExpenses = transactions
        .filter(t => {
            const date = new Date(t.date);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return t.type === 'expense' &&
                date.getMonth() === lastMonth.getMonth() &&
                date.getFullYear() === lastMonth.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseTrend = lastMonthExpenses > 0
        ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Overview of your financial status
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Balance"
                    value={formatCurrency(totalBalance, currency)}
                    icon={Wallet}
                    color="primary"
                />
                <SummaryCard
                    title="Monthly Income"
                    value={formatCurrency(monthlyIncome, currency)}
                    icon={TrendingUp}
                    color="success"
                />
                <SummaryCard
                    title="Monthly Expenses"
                    value={formatCurrency(monthlyExpenses, currency)}
                    icon={TrendingDown}
                    trend={expenseTrend > 0 ? 'up' : 'down'}
                    trendValue={`${Math.abs(expenseTrend)}% vs last month`}
                    color="danger"
                />
                <SummaryCard
                    title="Total Savings"
                    value={formatCurrency(totalSavings, currency)}
                    icon={PiggyBank}
                    color="purple"
                />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Charts and Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Distribution */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Expense Distribution
                    </h3>
                    <ExpensePieChart data={pieChartData} height={280} currency={currency} />
                </div>

                {/* Budget Overview */}
                <BudgetOverview />
            </div>

            {/* Recent Transactions */}
            <RecentTransactions />

            {/* Onboarding Overlay */}
            {!wizardDone && !settings?.onboarding_completed && (
                <OnboardingWizard onComplete={() => setWizardDone(true)} />
            )}
        </div>
    );
};

export default Dashboard;
