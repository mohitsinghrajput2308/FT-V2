import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatRelativeDate } from '../../utils/helpers';

const RecentTransactions = () => {
    const { transactions, currency } = useFinance();

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recentTransactions.length === 0) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Transactions
                    </h3>
                </div>
                <div className="text-center py-8 text-gray-400">
                    No transactions yet
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Transactions
                </h3>
                <Link
                    to="/dashboard/transactions"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income'
                                    ? 'bg-success-100 dark:bg-success-900/30'
                                    : 'bg-danger-100 dark:bg-danger-900/30'
                                }`}>
                                {transaction.type === 'income' ? (
                                    <ArrowUpCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                                ) : (
                                    <ArrowDownCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {transaction.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {transaction.category} • {formatRelativeDate(transaction.date)}
                                </p>
                            </div>
                        </div>
                        <span className={`font-semibold ${transaction.type === 'income'
                                ? 'text-success-600 dark:text-success-400'
                                : 'text-danger-600 dark:text-danger-400'
                            }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, currency)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTransactions;
