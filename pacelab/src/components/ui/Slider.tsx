import React from 'react';
import { cn } from '@/utils/cn';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  valueDisplay?: string | number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  valueDisplay,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {(label || valueDisplay !== undefined) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-[var(--muted)]">{label}</span>}
          {valueDisplay !== undefined && (
            <span className="text-[var(--accent)] font-semibold">{valueDisplay}</span>
          )}
        </div>
      )}

      <div className="relative flex items-center h-5 w-full select-none touch-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-[var(--line)] rounded-full appearance-none cursor-pointer accent-[var(--accent)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percentage}%, var(--line) ${percentage}%, var(--line) 100%)`,
          }}
        />
      </div>
    </div>
  );
};
