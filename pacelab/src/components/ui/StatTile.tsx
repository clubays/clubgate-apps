import React from 'react';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { cn } from '@/utils/cn';

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'speed' | 'accent' | 'warn';
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  variant = 'default',
  className,
}) => {
  const valueColor = {
    default: 'text-[var(--text)]',
    speed: 'text-[var(--speed)]',
    accent: 'text-[var(--accent)]',
    warn: 'text-[var(--warn)]',
  }[variant];

  return (
    <div
      className={cn(
        'relative rounded-[6px] border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      <CornerBrackets size={10} />

      <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono uppercase tracking-wider mb-2">
        <span>{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={cn('text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tracking-tight', valueColor)}>
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-[var(--muted)] lowercase">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-[11px] text-[var(--muted)] font-mono mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
