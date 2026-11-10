import React from 'react';
import { Delivery, UnitSystem } from '@/types';
import { convertSpeed } from '@/utils/units';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface DistributionChartProps {
  deliveries: Delivery[];
  units: UnitSystem;
  className?: string;
  height?: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  deliveries,
  units,
  className,
  height = 220,
}) => {
  if (deliveries.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-[var(--muted)] border border-dashed border-[var(--line)] rounded-[6px]"
        style={{ height }}
      >
        NO DISTRIBUTION DATA
      </div>
    );
  }

  // Convert speeds
  const converted = deliveries.map((d) => convertSpeed(d.speedMps, units));
  const minVal = Math.floor(Math.min(...converted));
  const maxVal = Math.ceil(Math.max(...converted));

  // Determine bucket size (e.g. 5 km/h or 3 mph or 1 m/s)
  const bucketStep = units === 'm/s' ? 1 : 5;
  const bucketStart = Math.floor(minVal / bucketStep) * bucketStep;
  const bucketEnd = Math.ceil(maxVal / bucketStep) * bucketStep;

  const buckets: { range: string; count: number; min: number }[] = [];
  for (let b = bucketStart; b <= bucketEnd; b += bucketStep) {
    const nextB = b + bucketStep;
    const count = converted.filter((val) => val >= b && (b === bucketEnd ? val <= nextB : val < nextB)).length;
    buckets.push({
      range: `${b}-${nextB}`,
      count,
      min: b,
    });
  }

  return (
    <div className={`w-full overflow-hidden ${className || ''}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={buckets}
          margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" opacity={0.6} />

          <XAxis
            dataKey="range"
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            tickLine={{ stroke: 'var(--line)' }}
            axisLine={{ stroke: 'var(--line)' }}
          />

          <YAxis
            allowDecimals={false}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={{ stroke: 'var(--line)' }}
            axisLine={{ stroke: 'var(--line)' }}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] p-2 shadow-xl text-xs font-mono">
                    <div className="text-[var(--muted)]">{item.range} {units}</div>
                    <div className="text-[var(--accent)] font-bold text-sm">
                      {item.count} {item.count === 1 ? 'ball' : 'balls'}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {buckets.map((b, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={b.count > 0 ? 'var(--accent)' : 'var(--line)'}
                opacity={b.count > 0 ? 0.85 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
