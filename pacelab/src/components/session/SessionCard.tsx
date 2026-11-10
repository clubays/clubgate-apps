import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Delivery, Session, UnitSystem } from '@/types';
import { formatDate, formatTimeAgo } from '@/utils/time';
import { convertSpeed, formatSpeed } from '@/utils/units';
import { ChevronRight, Zap, Target, Calendar } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  deliveries: Delivery[];
  units: UnitSystem;
  onDelete?: (session: Session) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  deliveries,
  units,
  onDelete,
}) => {
  const count = deliveries.length;
  const topSpeedMps = count > 0 ? Math.max(...deliveries.map((d) => d.speedMps)) : 0;
  const avgSpeedMps = count > 0 ? deliveries.reduce((acc, d) => acc + d.speedMps, 0) / count : 0;

  const topFormatted = formatSpeed(topSpeedMps, units, 1);
  const avgFormatted = formatSpeed(avgSpeedMps, units, 1);

  // Sparkline coordinates
  const sparklinePoints = deliveries.map((d) => convertSpeed(d.speedMps, units));
  const minSpark = Math.min(...sparklinePoints, 0);
  const maxSpark = Math.max(...sparklinePoints, 1);
  const sparkW = 100;
  const sparkH = 24;

  const polylinePoints = sparklinePoints
    .map((val, idx) => {
      const x = (idx / Math.max(1, count - 1)) * sparkW;
      const y = sparkH - ((val - minSpark) / Math.max(1, maxSpark - minSpark)) * sparkH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <Card
      withBrackets
      className="p-4 sm:p-5 hover:border-[var(--accent)]/50 transition-all group flex flex-col justify-between"
    >
      <div>
        {/* Top: Name & Date */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-heading font-semibold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              {session.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(session.createdAt)}</span>
              <span>•</span>
              <span>{formatTimeAgo(session.createdAt)}</span>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] font-mono text-xs font-semibold text-[var(--text)]">
            {count} {count === 1 ? 'ball' : 'balls'}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)]/50 text-xs font-mono">
          <div>
            <div className="text-[var(--muted)] flex items-center gap-1 mb-0.5">
              <Zap className="w-3 h-3 text-[var(--speed)]" />
              <span>TOP SPEED</span>
            </div>
            <div className="text-base font-bold text-[var(--speed)]">
              {topFormatted} <span className="text-[10px] text-[var(--muted)] font-normal">{units}</span>
            </div>
          </div>

          <div>
            <div className="text-[var(--muted)] flex items-center gap-1 mb-0.5">
              <Target className="w-3 h-3 text-[var(--accent)]" />
              <span>AVG SPEED</span>
            </div>
            <div className="text-base font-bold text-[var(--text)]">
              {avgFormatted} <span className="text-[10px] text-[var(--muted)] font-normal">{units}</span>
            </div>
          </div>
        </div>

        {/* Mini Sparkline */}
        {count >= 2 && (
          <div className="h-6 w-full my-2 overflow-hidden flex items-center">
            <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="var(--speed)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
                opacity="0.85"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
        {session.bowler ? (
          <span className="text-[var(--muted)] truncate max-w-[150px]">
            Bowler: <strong className="text-[var(--text)]">{session.bowler}</strong>
          </span>
        ) : (
          <span className="text-[var(--muted)]">{session.ballPreset.toUpperCase()} BALL</span>
        )}

        <Link
          to={`/sessions/${session.id}`}
          className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-semibold"
        >
          View Session
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
