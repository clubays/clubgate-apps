import React from 'react';
import { cn } from '@/utils/cn';

interface RadarSweepProps {
  className?: string;
  size?: number;
}

export const RadarSweep: React.FC<RadarSweepProps> = ({
  className,
  size = 320,
}) => {
  return (
    <div
      className={cn('relative flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      {/* Concentric rings */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="48" stroke="var(--line)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="36" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
        <circle cx="50" cy="50" r="24" stroke="var(--line)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="12" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
        <circle cx="50" cy="50" r="2" fill="var(--speed)" />

        {/* Crosshairs */}
        <line x1="50" y1="2" x2="50" y2="98" stroke="var(--line)" strokeWidth="0.5" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="var(--line)" strokeWidth="0.5" />

        {/* 45-degree diagonals */}
        <line x1="16" y1="16" x2="84" y2="84" stroke="var(--line)" strokeWidth="0.3" strokeDasharray="1 2" />
        <line x1="84" y1="16" x2="16" y2="84" stroke="var(--line)" strokeWidth="0.3" strokeDasharray="1 2" />

        {/* Bearing ticks */}
        <text x="50" y="8" fill="var(--muted)" fontSize="3.5" textAnchor="middle" fontFamily="var(--font-mono)">000°</text>
        <text x="92" y="51" fill="var(--muted)" fontSize="3.5" textAnchor="middle" fontFamily="var(--font-mono)">090°</text>
        <text x="50" y="96" fill="var(--muted)" fontSize="3.5" textAnchor="middle" fontFamily="var(--font-mono)">180°</text>
        <text x="8" y="51" fill="var(--muted)" fontSize="3.5" textAnchor="middle" fontFamily="var(--font-mono)">270°</text>
      </svg>

      {/* Rotating Sweep Beam */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{
          animation: 'radar-spin 4s linear infinite',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(34, 211, 238, 0.28) 0deg, rgba(34, 211, 238, 0.08) 35deg, transparent 60deg)',
          }}
        />
      </div>

      {/* Simulated detected ball blip */}
      <div
        className="absolute z-10 flex items-center justify-center pointer-events-none"
        style={{
          top: '34%',
          left: '68%',
        }}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--speed)] shadow-[0_0_10px_var(--speed)]" />
          <div className="absolute w-6 h-6 rounded-full border border-[var(--speed)] animate-ping opacity-60" />
          <span className="absolute left-4 -top-1.5 text-[10px] font-mono text-[var(--speed)] tracking-wider whitespace-nowrap bg-[var(--surface-2)]/90 px-1 py-0.5 rounded border border-[var(--line)]">
            142.4 km/h
          </span>
        </div>
      </div>

      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
