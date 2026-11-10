import React from 'react';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showBadge = true,
}) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div
        className="relative flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)]"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          width={iconSize - 6}
          height={iconSize - 6}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="9" stroke="var(--line)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5.5" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="2.8" fill="var(--speed)" />
          <path d="M12 3V21M3 12H21" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M12 12L19 5" stroke="var(--speed)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={cn('font-bold tracking-tight text-[var(--text)] font-heading', textSize)}>
          PACE<span className="text-[var(--accent)] font-mono font-semibold">LAB</span>
        </span>
        {showBadge && (
          <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border border-[var(--speed)]/30 text-[var(--speed)] bg-[var(--speed)]/10">
            V1.0
          </span>
        )}
      </div>
    </div>
  );
};
