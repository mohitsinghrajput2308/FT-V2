import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No data found',
    description = 'Get started by adding your first item.',
    action,
    actionLabel = 'Add Item',
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-300 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
                {description}
            </p>
            {action && (
                <Button onClick={action} variant="primary">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
