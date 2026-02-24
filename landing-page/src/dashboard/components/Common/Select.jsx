import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    className = '',
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
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 pr-10 rounded-lg appearance-none
            bg-white dark:bg-dark-200
            border border-gray-300 dark:border-dark-400
            text-gray-900 dark:text-gray-100
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            transition-all duration-200 cursor-pointer
            disabled:bg-gray-100 dark:disabled:bg-dark-300 disabled:cursor-not-allowed
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${className}
          `}
                    {...props}
                >
                    <option value="" className="text-gray-400">{placeholder}</option>
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="text-gray-900 dark:text-gray-100"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {error && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
