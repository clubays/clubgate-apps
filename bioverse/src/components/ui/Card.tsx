/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export function Card({
  className,
  variant = 'default',
  interactive = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs',
    elevated: 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-md',
    subtle: 'bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 transition-all',
        variants[variant],
        interactive && 'hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
