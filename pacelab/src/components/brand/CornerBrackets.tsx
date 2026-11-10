import React from 'react';
import { cn } from '@/utils/cn';

interface CornerBracketsProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CornerBrackets: React.FC<CornerBracketsProps> = ({
  className,
  size = 14,
  strokeWidth = 1,
  color = 'var(--accent)',
}) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Top Left */}
      <svg
        className="absolute top-0 left-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <path
          d={`M${size} ${strokeWidth}H${strokeWidth}V${size}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.65}
        />
      </svg>

      {/* Top Right */}
      <svg
        className="absolute top-0 right-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <path
          d={`M0 ${strokeWidth}H${size - strokeWidth}V${size}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.65}
        />
      </svg>

      {/* Bottom Left */}
      <svg
        className="absolute bottom-0 left-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <path
          d={`M${size} ${size - strokeWidth}H${strokeWidth}V0`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.65}
        />
      </svg>

      {/* Bottom Right */}
      <svg
        className="absolute bottom-0 right-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <path
          d={`M0 ${size - strokeWidth}H${size - strokeWidth}V0`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.65}
        />
      </svg>
    </div>
  );
};
