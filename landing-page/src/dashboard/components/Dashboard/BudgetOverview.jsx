import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculatePercentage, getBudgetColor } from '../../utils/helpers';
import ProgressBar from '../Common/ProgressBar';

const BudgetOverview = () => {
    const { budgets, currency } = useFinance();

    const activeBudgets = budgets.slice(0, 4);

    if (activeBudgets.length === 0) {
        return (
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Budget Overview
                    </h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No budgets set</p>
                    <Link
                        to="/dashboard/budgets"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Create your first budget
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Budget Overview
                </h3>
                <Link
                    to="/dashboard/budgets"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="space-y-4">
                {activeBudgets.map((budget) => {
                    const percentage = calculatePercentage(budget.spent, budget.limit);
                    const color = getBudgetColor(percentage);

                    return (
                        <div key={budget.id}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {budget.category}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.limit, currency)}
                                </span>
                            </div>
                            <ProgressBar value={budget.spent} max={budget.limit} color={color} size="sm" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetOverview;
