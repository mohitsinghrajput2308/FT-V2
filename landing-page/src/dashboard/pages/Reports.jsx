import { useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, groupByCategory, groupByMonth, getShortMonthName, calculateFinancialHealthScore, calculatePercentage } from '../utils/helpers';
import Card from '../components/Common/Card';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import TrendLineChart from '../components/Charts/TrendLineChart';

const Reports = () => {
    const { transactions, budgets, goals, currency } = useFinance();

    // Monthly data for charts
    const monthlyData = useMemo(() => {
        const grouped = groupByMonth(transactions);
        const months = Object.keys(grouped).sort().slice(-6);

        return months.map(month => ({
            month: getShortMonthName(month + '-01'),
            income: grouped[month].income,
            expense: grouped[month].expense
        }));
    }, [transactions]);

    // Expense by category for pie chart
    const expenseData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = groupByCategory(expenses);
        return Object.entries(grouped)
            .map(([name, data]) => ({ name, value: data.total }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // Income by category
    const incomeData = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income');
        const grouped = groupByCategory(income);
        return Object.entries(grouped)
            .map(([name, data]) => ({ name, value: data.total }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // Spending trend
    const spendingTrend = useMemo(() => {
        const grouped = groupByMonth(transactions.filter(t => t.type === 'expense'));
        const months = Object.keys(grouped).sort().slice(-6);
        return months.map(month => ({
            name: getShortMonthName(month + '-01'),
            value: grouped[month].expense
        }));
    }, [transactions]);

    // Financial health score
    const healthScore = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const savings = totalIncome - totalExpenses;

        const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0);
        const budgetSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
        const budgetUtilization = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;

        const goalsTotal = goals.reduce((s, g) => s + g.targetAmount, 0);
        const goalsCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
        const goalsProgress = goalsTotal > 0 ? (goalsCurrent / goalsTotal) * 100 : 0;

        return calculateFinancialHealthScore({
            income: totalIncome,
            expenses: totalExpenses,
            savings,
            budgetUtilization,
            goalsProgress
        });
    }, [transactions, budgets, goals]);

    // Top spending categories
    const topCategories = expenseData.slice(0, 5);
    const totalExpenses = expenseData.reduce((s, d) => s + d.value, 0);

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-success-500';
        if (score >= 60) return 'text-primary-500';
        if (score >= 40) return 'text-warning-500';
        return 'text-danger-500';
    };

    const getHealthLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400">Analyze your financial data</p>
            </div>

            {/* Financial Health Score */}
            <Card className="bg-gradient-to-r from-primary-500 to-success-500 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 mb-1">Financial Health Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{healthScore}</span>
                            <span className="text-xl">/100</span>
                        </div>
                        <p className="mt-2 text-primary-100">{getHealthLabel(healthScore)}</p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <Award className="w-10 h-10" />
                    </div>
                </div>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expense Chart */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Income vs Expenses (Last 6 Months)
                    </h3>
                    <IncomeExpenseChart data={monthlyData} height={300} currency={currency} />
                </Card>

                {/* Expense Distribution */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Expense Distribution
                    </h3>
                    <ExpensePieChart data={expenseData} height={300} currency={currency} />
                </Card>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Spending Trend
                    </h3>
                    <TrendLineChart data={spendingTrend} color="#ef4444" height={250} currency={currency} />
                </Card>

                {/* Top Spending Categories */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Top Spending Categories
                    </h3>
                    <div className="space-y-4">
                        {topCategories.map((cat, index) => {
                            const percentage = calculatePercentage(cat.value, totalExpenses);
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {formatCurrency(cat.value, currency)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Income Sources */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Income Sources Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomeData.map((source) => (
                        <div
                            key={source.name}
                            className="p-4 rounded-lg bg-gray-50 dark:bg-dark-300 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{source.name}</p>
                                <p className="text-success-600 dark:text-success-400 font-semibold">
                                    {formatCurrency(source.value, currency)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Reports;
