import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
};

const colors = {
    success: 'bg-success-50 text-success-800 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800',
    error: 'bg-danger-50 text-danger-800 border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-800',
    warning: 'bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800',
    info: 'bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800'
};

const Toast = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((notification) => {
                const Icon = icons[notification.type] || Info;
                return (
                    <div
                        key={notification.id}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
              animate-slide-in min-w-[300px] max-w-[400px]
              ${colors[notification.type] || colors.info}
            `}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <p className="flex-1 text-sm font-medium">{notification.message}</p>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Toast;
