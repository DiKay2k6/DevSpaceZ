import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className = '',
            label,
            error,
            leftIcon,
            rightIcon,
            fullWidth = true,
            type = 'text',
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const baseInputStyles = 'flex w-full py-2.5 rounded-xl border text-sm outline-none transition-all';
        const bgStyles = 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white';
        const placeholderStyles = 'placeholder:text-slate-400 dark:placeholder:text-slate-500';
        
        const stateStyles = error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-600';

        const paddingLeft = leftIcon ? 'pl-10' : 'pl-4';
        const paddingRight = (rightIcon || isPassword) ? 'pr-11' : 'pr-4';

        return (
            <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
                {label && (
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    
                    <input
                        ref={ref}
                        type={inputType}
                        className={`${baseInputStyles} ${bgStyles} ${placeholderStyles} ${stateStyles} ${paddingLeft} ${paddingRight} ${className}`}
                        {...props}
                    />

                    {/* Default Right Icon */}
                    {rightIcon && !isPassword && (
                        <div className="absolute right-3.5 text-slate-400">
                            {rightIcon}
                        </div>
                    )}

                    {/* Password Toggle Icon */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
