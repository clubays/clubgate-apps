import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-[4px]',
      md: 'h-10 px-4 text-sm rounded-[4px]',
      lg: 'h-12 px-6 text-base rounded-[6px]',
      icon: 'h-10 w-10 p-0 rounded-[4px]',
    };

    const variantStyles = {
      primary: 'bg-[var(--accent)] text-[#05080c] hover:brightness-110 active:brightness-95 font-semibold shadow-sm',
      accent: 'bg-[var(--speed)] text-[#05080c] hover:brightness-110 active:brightness-95 font-semibold shadow-sm',
      secondary: 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] hover:bg-[var(--line)] active:brightness-95',
      outline: 'bg-transparent text-[var(--text)] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
      danger: 'bg-[var(--danger)] text-white hover:brightness-110 active:brightness-95',
      ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
