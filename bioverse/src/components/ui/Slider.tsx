/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  displayValue?: string | number;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  displayValue,
  className,
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || displayValue !== undefined) && (
        <div className="flex justify-between items-center text-xs font-medium text-stone-600 dark:text-stone-400">
          <span>{label}</span>
          <span className="font-mono text-stone-800 dark:text-stone-200">
            {displayValue !== undefined ? displayValue : value}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
      />
    </div>
  );
}
