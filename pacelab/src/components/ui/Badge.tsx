import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'speed' | 'warn' | 'danger' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2 py-0.5 tracking-wide',
  };

  const variantStyles = {
    default: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--line)]',
    accent: 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40',
    speed: 'bg-[var(--speed)]/15 text-[var(--speed)] border-[var(--speed)]/40',
    warn: 'bg-[var(--warn)]/15 text-[var(--warn)] border-[var(--warn)]/40',
    danger: 'bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/40',
    muted: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-[4px] border uppercase select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
