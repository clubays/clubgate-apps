import React from 'react';
import { Delivery, UnitSystem } from '@/types';
import { convertSpeed, formatSpeed } from '@/utils/units';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface SpeedChartProps {
  deliveries: Delivery[];
  units: UnitSystem;
  className?: string;
  height?: number;
  onSelectDelivery?: (delivery: Delivery) => void;
}

export const SpeedChart: React.FC<SpeedChartProps> = ({
  deliveries,
  units,
  className,
  height = 240,
  onSelectDelivery,
}) => {
  if (deliveries.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-[var(--muted)] border border-dashed border-[var(--line)] rounded-[6px]"
        style={{ height }}
      >
        NO DELIVERIES RECORDED YET
      </div>
    );
  }

  const data = deliveries.map((d, idx) => ({
    index: idx + 1,
    speed: parseFloat(convertSpeed(d.speedMps, units).toFixed(1)),
    confidence: d.confidence,
    method: d.method,
    rawDelivery: d,
  }));

  const speeds = data.map((d) => d.speed);
  const minSpeed = Math.floor(Math.min(...speeds) * 0.95);
  const maxSpeed = Math.ceil(Math.max(...speeds) * 1.05);
  const avgSpeed = parseFloat((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1));

  return (
    <div className={`w-full overflow-hidden ${className || ''}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, left: -16, bottom: 0 }}
          onClick={(e) => {
            const chartEvent = e as { activePayload?: Array<{ payload: { rawDelivery: Delivery } }> } | null;
            if (chartEvent?.activePayload?.[0]?.payload?.rawDelivery && onSelectDelivery) {
              onSelectDelivery(chartEvent.activePayload[0].payload.rawDelivery);
            }
          }}
        >
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" opacity={0.6} />

          <XAxis
            dataKey="index"
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={{ stroke: 'var(--line)' }}
            axisLine={{ stroke: 'var(--line)' }}
          />

          <YAxis
            domain={[minSpeed, maxSpeed]}
            stroke="var(--muted)"
            tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            tickLine={{ stroke: 'var(--line)' }}
            axisLine={{ stroke: 'var(--line)' }}
            unit={` ${units}`}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-[4px] border border-[var(--line)] bg-[var(--surface-2)] p-2.5 shadow-xl text-xs font-mono">
                    <div className="text-[var(--muted)] mb-1">BALL #{item.index}</div>
                    <div className="text-[var(--speed)] font-bold text-base">
                      {item.speed} {units}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-1 flex gap-2">
                      <span>Method: {item.method}</span>
                      <span className={item.confidence === 'high' ? 'text-[var(--speed)]' : 'text-[var(--warn)]'}>
                        {item.confidence} conf
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Average speed reference line */}
          <ReferenceLine
            y={avgSpeed}
            stroke="var(--accent)"
            strokeDasharray="4 4"
            opacity={0.7}
            label={{
              value: `AVG ${avgSpeed}`,
              fill: 'var(--accent)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              position: 'right',
            }}
          />

          <Line
            type="monotone"
            dataKey="speed"
            stroke="var(--speed)"
            strokeWidth={2}
            dot={{ r: 3.5, fill: '#05080c', stroke: 'var(--speed)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--speed)', stroke: '#05080c', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
