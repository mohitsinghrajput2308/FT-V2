import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    type = 'text',
    className = '',
    icon: Icon,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full px-4 py-2.5 rounded-lg
            bg-white dark:bg-dark-200
            border border-gray-300 dark:border-dark-400
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            transition-all duration-200
            disabled:bg-gray-100 dark:disabled:bg-dark-300 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
