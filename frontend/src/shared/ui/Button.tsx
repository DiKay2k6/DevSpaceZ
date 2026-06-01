import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed outline-none';

        const variants = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-2 focus:ring-blue-500/30',
            secondary: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md focus:ring-2 focus:ring-slate-500/30',
            outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 focus:ring-2 focus:ring-slate-500/20',
            ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300',
            danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 focus:ring-2 focus:ring-red-500/30',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
            md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
            lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
            icon: 'p-2.5 rounded-xl',
        };

        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';
