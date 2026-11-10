import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Delivery, UnitSystem } from '@/types';
import { formatTimeAgo, formatTimestamp } from '@/utils/time';
import { formatSpeed, formatUncertainty, getSpeedClass } from '@/utils/units';
import { ChevronRight } from 'lucide-react';

interface DeliveryRowProps {
  index: number;
  delivery: Delivery;
  units: UnitSystem;
  onClick: () => void;
  className?: string;
}

export const DeliveryRow: React.FC<DeliveryRowProps> = ({
  index,
  delivery,
  units,
  onClick,
  className,
}) => {
  const speedClass = getSpeedClass(delivery.speedMps);
  const formattedSpeed = formatSpeed(delivery.speedMps, units, 1);
  const formattedUncertainty = formatUncertainty(delivery.uncertaintyMps, units, 1);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group flex items-center justify-between p-3 sm:p-4 rounded-[6px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${className || ''}`}
    >
      {/* Left: Index & Timestamp & Bowler */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center font-mono text-xs font-semibold text-[var(--muted)] group-hover:text-[var(--text)] flex-shrink-0">
          #{index}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--muted)]">
              {formatTimestamp(delivery.createdAt)}
            </span>
            {delivery.bowler && (
              <span className="text-xs font-medium text-[var(--text)] truncate">
                {delivery.bowler}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {delivery.method === 'gates' ? 'Gate Timing' : 'Fit Only'}
            </span>
            {delivery.preBounce && (
              <span className="text-[10px] font-mono text-amber-400">
                • Pre-bounce
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Speed readout & Badges & Chevron */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-[var(--speed)]">
              {formattedSpeed}
            </span>
            <span className="text-xs font-mono text-[var(--muted)]">
              {units}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[var(--muted)]">
            {formattedUncertainty}
          </span>
        </div>

        <div className="hidden sm:flex flex-col gap-1 items-end">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${speedClass.badgeClass}`}>
            {speedClass.name}
          </span>
          <span className={`text-[9px] font-mono ${delivery.confidence === 'high' ? 'text-[var(--speed)]' : 'text-[var(--warn)]'}`}>
            {delivery.confidence} conf
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};
