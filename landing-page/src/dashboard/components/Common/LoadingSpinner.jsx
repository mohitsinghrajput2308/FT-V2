import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
    </div>
);

export const Skeleton = ({ className = '', variant = 'text' }) => {
    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-10 w-10 rounded-full',
        button: 'h-10 w-24',
        card: 'h-32 w-full'
    };

    return (
        <div className={`skeleton rounded ${variants[variant]} ${className}`} />
    );
};

export default LoadingSpinner;
