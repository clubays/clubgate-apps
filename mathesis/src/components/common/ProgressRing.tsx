import React from "react";

interface ProgressRingProps {
  size: number;
  pct: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  pct,
  strokeWidth = 2,
  children,
  className = "",
}) => {
  const r = size / 2 - strokeWidth - 0.5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  const isDone = pct >= 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 block"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--line)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={isDone ? "var(--c-d)" : "var(--accent)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center font-mono font-medium leading-none text-center select-none"
          style={{ fontSize: size <= 26 ? "9px" : "10px", color: "var(--ink)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
