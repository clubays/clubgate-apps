/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CalloutProps {
  type: 'definition' | 'idea' | 'warning' | 'fact';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ type, title, children, className }: CalloutProps) {
  const configs = {
    definition: {
      icon: <BookOpen size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />,
      bg: 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60',
      titleColor: 'text-teal-900 dark:text-teal-200',
      defaultTitle: 'Definition',
    },
    idea: {
      icon: <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />,
      bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60',
      titleColor: 'text-amber-900 dark:text-amber-200',
      defaultTitle: 'Key Idea',
    },
    warning: {
      icon: <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />,
      bg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60',
      titleColor: 'text-rose-900 dark:text-rose-200',
      defaultTitle: 'Watch Out',
    },
    fact: {
      icon: <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />,
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60',
      titleColor: 'text-indigo-900 dark:text-indigo-200',
      defaultTitle: 'Fun Fact',
    },
  };

  const current = configs[type];

  return (
    <div
      className={cn(
        'my-3.5 p-3.5 rounded-xl border text-sm leading-relaxed',
        current.bg,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1 font-semibold text-xs uppercase tracking-wide">
        {current.icon}
        <span className={current.titleColor}>{title || current.defaultTitle}</span>
      </div>
      <div className="text-stone-700 dark:text-stone-300">{children}</div>
    </div>
  );
}
