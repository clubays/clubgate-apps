import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';

export default function SessionSpeedChart({ deliveries = [] }) {
  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  const valid = deliveries
    .map((d, idx) => ({
      name: d.name || `B${idx + 1}`,
      speed: d.metrics?.speed?.mps ? toUnit(d.metrics.speed.mps) : null,
      sd: d.metrics?.speed?.sd ? toUnit(d.metrics.speed.sd) : 0,
      grade: d.grade?.grade || 'D',
    }))
    .filter((d) => d.speed !== null);

  if (valid.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center bg-[#182231] border border-[#243146] rounded-xl text-xs text-[#8a9ab0]">
        No completed deliveries in this session yet
      </div>
    );
  }

  const speeds = valid.map((d) => d.speed);
  const minSpeed = Math.max(0, Math.min(...speeds) - 15);
  const maxSpeed = Math.max(...speeds) + 15;

  const width = 600;
  const height = 180;
  const padL = 45;
  const padR = 25;
  const padT = 20;
  const padB = 30;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toX = (idx) => padL + (valid.length > 1 ? (idx / (valid.length - 1)) * plotW : plotW / 2);
  const toY = (spd) => padT + plotH - ((spd - minSpeed) / (maxSpeed - minSpeed || 1)) * plotH;

  const pathD = valid
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(idx)} ${toY(d.speed)}`)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5 w-full bg-[#121923] border border-[#243146] rounded-xl p-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-[#8a9ab0] uppercase">Session Speed Progression</span>
        <span className="text-[#c6ff3d] font-mono font-bold">
          Avg {Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)} {unitLabel}
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

        {/* Trend line */}
        {valid.length > 1 && (
          <path d={pathD} fill="none" stroke="#c6ff3d" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Data points */}
        {valid.map((d, idx) => {
          const cx = toX(idx);
          const cy = toY(d.speed);
          return (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="5" fill="#c6ff3d" stroke="#0b0f14" strokeWidth="1.5" />
              <text x={cx} y={height - 10} fill="#8a9ab0" fontSize="9" textAnchor="middle">
                {d.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
