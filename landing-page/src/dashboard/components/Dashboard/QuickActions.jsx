import { Link } from 'react-router-dom';
import { Plus, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        {
            label: 'Add Income',
            icon: ArrowUpCircle,
            path: '/dashboard/income',
            color: 'bg-success-500 hover:bg-success-600'
        },
        {
            label: 'Add Expense',
            icon: ArrowDownCircle,
            path: '/dashboard/expenses',
            color: 'bg-danger-500 hover:bg-danger-600'
        },
        {
            label: 'Add Goal',
            icon: Target,
            path: '/dashboard/goals',
            color: 'bg-primary-500 hover:bg-primary-600'
        }
    ];

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        to={action.path}
                        className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <action.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
