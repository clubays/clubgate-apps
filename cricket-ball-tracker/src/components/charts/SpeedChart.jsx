import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';

export default function SpeedChart({ delivery }) {
  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  if (!delivery || !delivery.points || delivery.points.length < 3) {
    return (
      <div className="h-44 flex items-center justify-center bg-[#182231] border border-[#243146] rounded-xl text-xs text-[#8a9ab0]">
        No trajectory points recorded
      </div>
    );
  }

  // Calculate instantaneous velocity along trajectory
  const points = delivery.points;
  const speedSamples = [];
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dt = p2.t - p1.t;
    if (dt > 0.002 && p1.X != null && p2.X != null) {
      const dX = p2.X - p1.X;
      const spd = Math.abs(dX / dt);
      speedSamples.push({
        t: p2.t,
        speed: toUnit(spd),
        isPreBounce: delivery.tBounce ? p2.t <= delivery.tBounce : true,
      });
    }
  }

  if (speedSamples.length < 2) return null;

  const minSpeed = Math.max(0, Math.min(...speedSamples.map((s) => s.speed)) - 10);
  const maxSpeed = Math.max(...speedSamples.map((s) => s.speed)) + 10;
  const tMin = speedSamples[0].t;
  const tMax = speedSamples[speedSamples.length - 1].t;
  const dtTotal = tMax - tMin || 0.1;

  const width = 500;
  const height = 180;
  const padL = 45;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toX = (t) => padL + ((t - tMin) / dtTotal) * plotW;
  const toY = (spd) => padT + plotH - ((spd - minSpeed) / (maxSpeed - minSpeed || 1)) * plotH;

  const pathD = speedSamples
    .map((s, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(s.t)} ${toY(s.speed)}`)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5 w-full bg-[#121923] border border-[#243146] rounded-xl p-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-[#8a9ab0] uppercase">Speed Profile ({unitLabel})</span>
        <span className="text-[#c6ff3d] font-mono font-bold">
          Peak {Math.round(toUnit(delivery.metrics?.speed?.mps || 0))} {unitLabel}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const val = minSpeed + (maxSpeed - minSpeed) * (1 - pct);
          const y = padT + pct * plotH;
          return (
            <g key={idx}>
              <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="#243146" strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 4} fill="#8a9ab0" fontSize="10" textAnchor="end">
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Bounce line marker */}
        {delivery.tBounce && (
          <g>
            <line
              x1={toX(delivery.tBounce)}
              y1={padT}
              x2={toX(delivery.tBounce)}
              y2={padT + plotH}
              stroke="#ffb020"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x={toX(delivery.tBounce)} y={padT - 6} fill="#ffb020" fontSize="9" textAnchor="middle">
              Bounce
            </text>
          </g>
        )}

        {/* Speed Curve */}
        <path d={pathD} fill="none" stroke="#c6ff3d" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {speedSamples.map((s, idx) => (
          <circle
            key={idx}
            cx={toX(s.t)}
            cy={toY(s.speed)}
            r="3"
            fill={s.isPreBounce ? '#c6ff3d' : '#ffb020'}
            stroke="#0b0f14"
            strokeWidth="1"
          />
        ))}

        {/* Bottom time labels */}
        <text x={padL} y={height - 8} fill="#8a9ab0" fontSize="10">
          Release
        </text>
        <text x={padL + plotW} y={height - 8} fill="#8a9ab0" fontSize="10" textAnchor="end">
          {(dtTotal * 1000).toFixed(0)} ms
        </text>
      </svg>
    </div>
  );
}
