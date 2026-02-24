const ProgressBar = ({
    value = 0,
    max = 100,
    color = 'primary',
    size = 'md',
    showLabel = false,
    label = '',
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        danger: 'bg-danger-500',
        gradient: 'bg-gradient-to-r from-primary-500 to-success-500'
    };

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    // Auto color based on percentage
    const getAutoColor = () => {
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return 'success';
    };

    const barColor = color === 'auto' ? getAutoColor() : color;

    return (
        <div className={className}>
            {(showLabel || label) && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                    {showLabel && (
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-200 dark:bg-dark-400 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${sizes[size]} ${colors[barColor]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
