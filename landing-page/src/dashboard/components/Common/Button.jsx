import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-dark-300 dark:text-gray-200 dark:hover:bg-dark-400',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 dark:bg-success-500 dark:hover:bg-success-600',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 dark:bg-danger-500 dark:hover:bg-danger-600',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-300',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20'
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </button>
    );
};

export default Button;
