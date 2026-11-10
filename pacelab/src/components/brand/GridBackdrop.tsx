import React from 'react';
import { cn } from '@/utils/cn';

interface GridBackdropProps {
  className?: string;
  withScanlines?: boolean;
}

export const GridBackdrop: React.FC<GridBackdropProps> = ({
  className,
  withScanlines = true,
}) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial vignette mask to fade edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, var(--bg) 95%)',
        }}
      />

      {/* Scanline overlay */}
      {withScanlines && <div className="scanline-overlay absolute inset-0" />}
    </div>
  );
};
