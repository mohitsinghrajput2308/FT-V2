import { TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colors = {
        primary: 'from-primary-500 to-primary-600',
        success: 'from-success-500 to-success-600',
        warning: 'from-warning-500 to-warning-600',
        danger: 'from-danger-500 to-danger-600',
        purple: 'from-purple-500 to-purple-600'
    };

    const bgColors = {
        primary: 'bg-primary-50 dark:bg-primary-900/20',
        success: 'bg-success-50 dark:bg-success-900/20',
        warning: 'bg-warning-50 dark:bg-warning-900/20',
        danger: 'bg-danger-50 dark:bg-danger-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20'
    };

    const iconColors = {
        primary: 'text-primary-600 dark:text-primary-400',
        success: 'text-success-600 dark:text-success-400',
        warning: 'text-warning-600 dark:text-warning-400',
        danger: 'text-danger-600 dark:text-danger-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    return (
        <div className="card p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-success-600' : 'text-danger-600'
                            }`}>
                            {trend === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${bgColors[color]} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColors[color]}`} />
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
