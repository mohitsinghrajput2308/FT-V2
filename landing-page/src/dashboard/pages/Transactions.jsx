import { useState, useMemo } from 'react';
import { Search, Download, ArrowUpCircle, ArrowDownCircle, List } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, sortByDate, convertToCSV, downloadFile } from '../utils/helpers';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import EmptyState from '../components/Common/EmptyState';

const Transactions = () => {
    const { transactions, currency, dateFormat } = useFinance();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterType) {
            filtered = filtered.filter(t => t.type === filterType);
        }

        if (filterCategory) {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        if (dateFrom) {
            filtered = filtered.filter(t => t.date >= dateFrom);
        }

        if (dateTo) {
            filtered = filtered.filter(t => t.date <= dateTo);
        }

        return sortByDate(filtered, 'date', 'desc');
    }, [transactions, searchQuery, filterType, filterCategory, dateFrom, dateTo]);

    // Get unique categories
    const categories = [...new Set(transactions.map(t => t.category))].map(c => ({
        value: c,
        label: c
    }));

    const handleExport = () => {
        const headers = ['date', 'type', 'name', 'category', 'amount', 'paymentMethod', 'description'];
        const csv = convertToCSV(filteredTransactions, headers);
        downloadFile(csv, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400">View all your transactions</p>
                </div>
                <Button onClick={handleExport} icon={Download} variant="secondary">
                    Export CSV
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                        <ArrowUpCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                        <p className="text-xl font-bold text-success-600 dark:text-success-400">
                            {formatCurrency(totalIncome, currency)}
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                        <ArrowDownCircle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                        <p className="text-xl font-bold text-danger-600 dark:text-danger-400">
                            {formatCurrency(totalExpense, currency)}
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <List className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>
                        <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            {formatCurrency(totalIncome - totalExpense, currency)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Input
                        placeholder="Search..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select
                        placeholder="All Types"
                        options={[
                            { value: 'income', label: 'Income' },
                            { value: 'expense', label: 'Expense' }
                        ]}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    />
                    <Select
                        placeholder="All Categories"
                        options={categories}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder="From"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder="To"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
            </Card>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
                <EmptyState
                    icon={List}
                    title="No transactions found"
                    description="Try adjusting your filters or add some transactions."
                />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="text-gray-600 dark:text-gray-400">
                                        {formatDate(t.date, dateFormat)}
                                    </td>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                                        {t.paymentMethod && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.paymentMethod}</p>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {t.type === 'income' ? (
                                                <ArrowUpCircle className="w-4 h-4 text-success-500" />
                                            ) : (
                                                <ArrowDownCircle className="w-4 h-4 text-danger-500" />
                                            )}
                                            <span className="capitalize text-gray-600 dark:text-gray-400">{t.type}</span>
                                        </div>
                                    </td>
                                    <td className={`font-semibold ${t.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
        </div>
    );
};

export default Transactions;
