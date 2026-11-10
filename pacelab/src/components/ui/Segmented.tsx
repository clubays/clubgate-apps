import React from 'react';
import { cn } from '@/utils/cn';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedProps<T>) {
  const sizeStyles = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
  };

  const itemSizeStyles = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex items-center rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] select-none',
        sizeStyles[size],
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-[4px] font-mono font-medium transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]',
              itemSizeStyles[size],
              isSelected
                ? 'bg-[var(--accent)] text-[#05080c] font-semibold shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
