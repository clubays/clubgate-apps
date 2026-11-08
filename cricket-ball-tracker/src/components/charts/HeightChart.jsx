import React from 'react';
import { PITCH } from '../../data/landmarks.js';

export default function HeightChart({ delivery }) {
  if (!delivery || !delivery.points || delivery.points.length < 3) {
    return null;
  }

  const valid = delivery.points.filter((p) => p.X != null && p.Z != null);
  if (valid.length < 2) return null;

  const width = 500;
  const height = 180;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxZ = 2.5; // metres
  const toX = (xMeters) => padL + (Math.max(0, Math.min(20.12, xMeters)) / 20.12) * plotW;
  const toY = (zMeters) => padT + plotH - (Math.max(0, Math.min(maxZ, zMeters)) / maxZ) * plotH;

  const pathD = valid.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(p.X)} ${toY(p.Z)}`).join(' ');

  return (
    <div className="flex flex-col gap-1.5 w-full bg-[#121923] border border-[#243146] rounded-xl p-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-[#8a9ab0] uppercase">Flight Height Profile (Z)</span>
        <span className="text-[#38bdf8] font-mono font-bold">
          Bounce Height: {delivery.metrics?.bounceHeight ? `${delivery.metrics.bounceHeight.toFixed(2)} m` : '—'}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Ground */}
        <line x1={padL} y1={toY(0)} x2={padL + plotW} y2={toY(0)} stroke="#2fd27e" strokeWidth="2" />
        <text x={padL - 6} y={toY(0) + 4} fill="#8a9ab0" fontSize="10" textAnchor="end">
          0m
        </text>

        {/* 1m & 2m height markers */}
        <line x1={padL} y1={toY(1.0)} x2={padL + plotW} y2={toY(1.0)} stroke="#243146" strokeDasharray="3 3" />
        <text x={padL - 6} y={toY(1.0) + 4} fill="#8a9ab0" fontSize="10" textAnchor="end">
          1m
        </text>
        <line x1={padL} y1={toY(2.0)} x2={padL + plotW} y2={toY(2.0)} stroke="#243146" strokeDasharray="3 3" />
        <text x={padL - 6} y={toY(2.0) + 4} fill="#8a9ab0" fontSize="10" textAnchor="end">
          2m
        </text>

        {/* Stumps at bowler end (X=0) and striker end (X=20.12) */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(0)}
          y2={toY(PITCH.stumpHeight)}
          stroke="#ffb020"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1={toX(20.12)}
          y1={toY(0)}
          x2={toX(20.12)}
          y2={toY(PITCH.stumpHeight)}
          stroke="#ffb020"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Flight path curve */}
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Stumps crossing indicator */}
        {delivery.metrics?.stumpsCrossingZ != null && (
          <circle
            cx={toX(20.12)}
            cy={toY(delivery.metrics.stumpsCrossingZ)}
            r="4.5"
            fill={delivery.metrics.isHittingStumps ? '#e5473f' : '#38bdf8'}
            stroke="#0b0f14"
            strokeWidth="1.5"
          />
        )}

        {/* Labels */}
        <text x={toX(0)} y={height - 8} fill="#8a9ab0" fontSize="10">
          Bowler 0m
        </text>
        <text x={toX(20.12)} y={height - 8} fill="#8a9ab0" fontSize="10" textAnchor="end">
          Striker 20.12m
        </text>
      </svg>
    </div>
  );
}
