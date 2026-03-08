import { useMemo, useState, useRef } from 'react';
import {
    TrendingUp, TrendingDown, Activity, Award, Download,
    Calendar, DollarSign, Percent, Target, BarChart2, Wallet, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import {
    formatCurrency, groupByCategory, groupByMonth, getShortMonthName,
    calculateFinancialHealthScore, calculatePercentage
} from '../utils/helpers';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Card from '../components/Common/Card';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import TrendLineChart from '../components/Charts/TrendLineChart';
import UpgradeModal from '../components/Common/UpgradeModal';
import { useSubscription } from '../../hooks/useSubscription';

const RANGE_OPTIONS = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 3 Months', value: '3m' },
    { label: 'Last 6 Months', value: '6m' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
];

const DOW_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#10b981', '#3b82f6'];
const BAR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899'];

const Reports = () => {
    const { transactions, budgets, goals, currency } = useFinance();
    const [range, setRange] = useState('6m');
    const reportRef = useRef(null);

    // ── Filter transactions by selected range ────────────────────────────────
    const filteredTxs = useMemo(() => {
        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth();

        return transactions.filter(t => {
            if (!t.date) return false;
            const d = new Date(t.date);
            if (range === 'this_month') return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
            if (range === '3m') { const c = new Date(now); c.setMonth(c.getMonth() - 3); return d >= c; }
            if (range === '6m') { const c = new Date(now); c.setMonth(c.getMonth() - 6); return d >= c; }
            if (range === 'year') return d.getFullYear() === thisYear;
            return true; // all
        });
    }, [transactions, range]);

    // ── KPI totals ───────────────────────────────────────────────────────────
    const kpi = useMemo(() => {
        const income = filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const net = income - expense;
        const savingsRate = income > 0 ? (net / income) * 100 : 0;
        return { income, expense, net, savingsRate };
    }, [filteredTxs]);

    // ── Monthly income/expense/savings ───────────────────────────────────────
    const monthlyData = useMemo(() => {
        const grouped = groupByMonth(filteredTxs);
        return Object.keys(grouped).sort().map(month => ({
            month: getShortMonthName(month + '-01'),
            income: grouped[month].income,
            expense: grouped[month].expense,
            savings: grouped[month].income - grouped[month].expense,
        }));
    }, [filteredTxs]);

    // ── Expense by category ──────────────────────────────────────────────────
    const expenseData = useMemo(() => {
        const grouped = groupByCategory(filteredTxs.filter(t => t.type === 'expense'));
        return Object.entries(grouped)
            .map(([name, d]) => ({ name, value: d.total }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTxs]);

    // ── Income by category ───────────────────────────────────────────────────
    const incomeData = useMemo(() => {
        const grouped = groupByCategory(filteredTxs.filter(t => t.type === 'income'));
        return Object.entries(grouped)
            .map(([name, d]) => ({ name, value: d.total }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTxs]);

    // ── Spending trend (expense only) ────────────────────────────────────────
    const spendingTrend = useMemo(() =>
        monthlyData.map(m => ({ name: m.month, value: m.expense })),
        [monthlyData]);

    // ── Net savings trend ────────────────────────────────────────────────────
    const savingsTrend = useMemo(() =>
        monthlyData.map(m => ({ name: m.month, value: m.savings })),
        [monthlyData]);

    // ── Day-of-week spending pattern ─────────────────────────────────────────
    const dowData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const totals = new Array(7).fill(0);
        filteredTxs.filter(t => t.type === 'expense').forEach(t => {
            const d = new Date(t.date).getDay();
            totals[d] += t.amount;
        });
        return days.map((label, i) => ({ day: label, amount: parseFloat(totals[i].toFixed(2)) }));
    }, [filteredTxs]);

    // ── Financial health score (current month always) ────────────────────────
    const healthScore = useMemo(() => {
        const curStr = new Date().toISOString().slice(0, 7);
        const curTxs = transactions.filter(t => t.date?.startsWith(curStr));
        const inc = curTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = curTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const curBudgets = budgets.filter(b => b.month === curStr);
        const budgetTotal = curBudgets.reduce((s, b) => s + (b.amount || 0), 0);
        const budgetSpent = curBudgets.reduce((s, b) => s + (b.spent || 0), 0);
        const goalsTotal = goals.reduce((s, g) => s + g.targetAmount, 0);
        const goalsCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
        return calculateFinancialHealthScore({
            income: inc, expenses: exp, savings: inc - exp,
            budgetUtilization: budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0,
            goalsProgress: goalsTotal > 0 ? (goalsCurrent / goalsTotal) * 100 : 0,
        });
    }, [transactions, budgets, goals]);

    // ── Top spending categories ──────────────────────────────────────────────
    const topCategories = expenseData.slice(0, 5);
    const totalExpenses = expenseData.reduce((s, d) => s + d.value, 0);

    // ── Budget utilization ───────────────────────────────────────────────────
    const budgetUtilization = useMemo(() => {
        return budgets.map(b => ({
            name: b.category || b.name || 'Budget',
            amount: b.amount || 0,
            spent: b.spent || 0,
            pct: b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0,
        })).sort((a, b) => b.pct - a.pct).slice(0, 8);
    }, [budgets]);

    // ── Export PDF (Pro/Business only) ───────────────────────────────────────
    const { isPro, isBusiness } = useSubscription();
    const isPaid = isPro || isBusiness;
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!isPaid) {
            setIsUpgradeModalOpen(true);
            return;
        }

        if (!reportRef.current) return;

        setIsExporting(true);
        try {
            // Capture the entire dashboard element containing the reports
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // higher resolution
                useCORS: true,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0A0A0B' : '#F9FAFB'
            });

            // Calculate PDF dimensions mapping canvas to A4 aspect
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Optional styling for PDF header
            pdf.setFontSize(16);
            pdf.text(`FinTrack Report: ${range === 'all' ? 'All Time' : range.replace('_', ' ').toUpperCase()}`, 10, 10);

            // Adding image starting heavily off the top due to the title text above
            pdf.addImage(imgData, 'PNG', 0, 15, pdfWidth, pdfHeight);

            pdf.save(`fintrack_report_${range}.pdf`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const getHealthColor = (s) => s >= 80 ? 'text-success-500' : s >= 60 ? 'text-primary-500' : s >= 40 ? 'text-warning-500' : 'text-danger-500';
    const getHealthLabel = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Improvement';
    const getBudgetBarColor = (pct) => pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';

    return (
        <div className="space-y-6" ref={reportRef}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Deep dive into your financial data</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date range filter */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-300 rounded-xl p-1">
                        {RANGE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setRange(opt.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${range === opt.value
                                        ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${isExporting ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                            }`}
                        title={!isPaid ? 'Pro feature — upgrade to export' : 'Export PDF'}
                    >
                        {!isPaid && !isExporting && <span className="text-xs">🔒</span>}
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Financial Health Score */}
            <Card className="bg-gradient-to-r from-primary-500 to-success-500 text-white" hover={false}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 mb-1 text-sm">Financial Health Score (This Month)</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">{healthScore}</span>
                            <span className="text-xl">/100</span>
                        </div>
                        <p className="mt-2 text-primary-100">{getHealthLabel(healthScore)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <Award className="w-10 h-10" />
                        </div>
                        <p className="text-xs text-primary-100">Based on savings, budget & goals</p>
                    </div>
                </div>
                {/* Score bar */}
                <div className="mt-4">
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${healthScore}%` }} />
                    </div>
                </div>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding={false} className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                            <TrendingUp className="w-4.5 h-4.5 text-success-600 dark:text-success-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
                    </div>
                    <p className="text-xl font-bold text-success-600 dark:text-success-400">{formatCurrency(kpi.income, currency)}</p>
                </Card>
                <Card padding={false} className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                            <TrendingDown className="w-4.5 h-4.5 text-danger-600 dark:text-danger-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</p>
                    </div>
                    <p className="text-xl font-bold text-danger-600 dark:text-danger-400">{formatCurrency(kpi.expense, currency)}</p>
                </Card>
                <Card padding={false} className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.net >= 0 ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-warning-100 dark:bg-warning-900/30'}`}>
                            <Wallet className={`w-4.5 h-4.5 ${kpi.net >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-warning-600 dark:text-warning-400'}`} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Net Savings</p>
                    </div>
                    <p className={`text-xl font-bold ${kpi.net >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-warning-600'}`}>
                        {kpi.net >= 0 ? '+' : ''}{formatCurrency(kpi.net, currency)}
                    </p>
                </Card>
                <Card padding={false} className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.savingsRate >= 20 ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-900/30'}`}>
                            <Percent className={`w-4.5 h-4.5 ${kpi.savingsRate >= 20 ? 'text-success-600 dark:text-success-400' : 'text-warning-600'}`} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
                    </div>
                    <p className={`text-xl font-bold ${kpi.savingsRate >= 20 ? 'text-success-600 dark:text-success-400' : 'text-warning-600'}`}>
                        {kpi.savingsRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{kpi.savingsRate >= 20 ? 'On track 🎯' : 'Target: 20%'}</p>
                </Card>
            </div>

            {/* Charts Row 1: Income vs Expense + Expense Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
                    <IncomeExpenseChart data={monthlyData} height={280} currency={currency} />
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Distribution</h3>
                    <ExpensePieChart data={expenseData} height={280} currency={currency} />
                </Card>
            </div>

            {/* Charts Row 2: Spending Trend + Net Savings Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Spending Trend</h3>
                    <p className="text-xs text-gray-400 mb-4">Monthly expense movement</p>
                    <TrendLineChart data={spendingTrend} color="#ef4444" height={230} currency={currency} />
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Net Savings Trend</h3>
                    <p className="text-xs text-gray-400 mb-4">Income minus expenses each month</p>
                    <TrendLineChart data={savingsTrend} color="#10b981" height={230} currency={currency} />
                </Card>
            </div>

            {/* Day-of-week pattern + Top categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Day-of-Week Spending</h3>
                    <p className="text-xs text-gray-400 mb-4">Which days you spend the most</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dowData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:[&>line]:stroke-[#2a2a3a]" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} tickFormatter={v => formatCurrency(v, currency).replace(/\.00$/, '')} width={60} />
                            <Tooltip formatter={v => [formatCurrency(v, currency), 'Spent']} contentStyle={{ fontSize: 12 }} />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {dowData.map((_, i) => <Cell key={i} fill={DOW_COLORS[i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h3>
                    <div className="space-y-4">
                        {topCategories.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">No expense data for selected period</p>
                        ) : topCategories.map((cat, index) => {
                            const percentage = calculatePercentage(cat.value, totalExpenses);
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">{cat.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(cat.value, currency)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: BAR_COLORS[index] }} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{percentage.toFixed(1)}% of total expenses</p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Monthly Summary Table */}
            <Card padding={false}>
                <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-400 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Summary</h3>
                    <BarChart2 className="w-5 h-5 text-gray-400" />
                </div>
                {monthlyData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No data for selected period</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-dark-400">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Income</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Expenses</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Net Savings</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Savings Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((row, i) => {
                                    const rate = row.income > 0 ? (row.savings / row.income) * 100 : 0;
                                    return (
                                        <tr key={i} className="border-b border-gray-50 dark:border-dark-400/50 hover:bg-gray-50 dark:hover:bg-dark-300/30 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{row.month}</td>
                                            <td className="px-5 py-3 text-right text-success-600 dark:text-success-400 font-semibold">{formatCurrency(row.income, currency)}</td>
                                            <td className="px-5 py-3 text-right text-danger-600 dark:text-danger-400 font-semibold">{formatCurrency(row.expense, currency)}</td>
                                            <td className={`px-5 py-3 text-right font-bold ${row.savings >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-warning-600'}`}>
                                                {row.savings >= 0 ? '+' : ''}{formatCurrency(row.savings, currency)}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rate >= 20 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : rate >= 10 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'}`}>
                                                    {rate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Budget Utilization */}
            {budgetUtilization.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Budget Utilization</h3>
                    <p className="text-xs text-gray-400 mb-5">How much of each budget has been used</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {budgetUtilization.map(b => (
                            <div key={b.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{b.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap ml-2">
                                        {formatCurrency(b.spent, currency)} / {formatCurrency(b.amount, currency)}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-dark-400 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${b.pct}%`, backgroundColor: getBudgetBarColor(b.pct) }} />
                                </div>
                                <p className={`text-xs mt-0.5 font-semibold ${b.pct >= 90 ? 'text-danger-500' : b.pct >= 70 ? 'text-warning-500' : 'text-success-500'}`}>
                                    {b.pct.toFixed(0)}% used {b.pct >= 100 ? '— Over budget!' : b.pct >= 90 ? '— Almost full' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Income Sources Breakdown */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income Sources</h3>
                {incomeData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No income data for selected period</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {incomeData.map((source, i) => (
                            <div key={source.name} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{source.name}</p>
                                    <p className="text-success-600 dark:text-success-400 font-bold">{formatCurrency(source.value, currency)}</p>
                                    <p className="text-xs text-gray-400">{calculatePercentage(source.value, kpi.income).toFixed(1)}% of income</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgrade={() => setIsUpgradeModalOpen(false)}
            />
        </div>
    );
};

export default Reports;