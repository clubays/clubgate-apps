/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface ChipProps {
  label: string;
  variant?: 'default' | 'accent' | 'teal' | 'rose' | 'amber' | 'blue';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Chip({
  label,
  variant = 'default',
  size = 'sm',
  icon,
  className,
  onClick,
}: ChipProps) {
  const variants = {
    default: 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700',
    accent: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800',
    teal: 'bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-800',
    rose: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800',
    blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1',
    md: 'text-sm px-2.5 py-1 rounded-lg gap-1.5',
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center font-medium border transition-colors',
        variants[variant],
        sizes[size],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
