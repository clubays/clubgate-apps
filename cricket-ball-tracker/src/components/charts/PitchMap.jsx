import React, { useState } from 'react';
import { PITCH } from '../../data/landmarks.js';
import { DEFAULT_LENGTH_ZONES } from '../../data/lengthZones.js';
import { formatSpeed } from '../../utils/units.js';

export default function PitchMap({ deliveries = [], selectedDelivery = null, onSelectDelivery, view = 'top' }) {
  const [currentView, setCurrentView] = useState(view); // 'top' | 'side'

  // Dimensions in SVG coordinates
  // Pitch is 20.12m long x 2.64m wide. In side-on, 20.12m long x 3.0m high
  const svgWidth = 800;
  const svgHeight = currentView === 'top' ? 220 : 220;

  const padX = 60;
  const padY = 40;
  const pitchPlotWidth = svgWidth - 2 * padX;
  const pitchPlotHeight = svgHeight - 2 * padY;

  // Coordinate transforms
  // X = 0 (bowler end) -> padX, X = 20.12 (striker end) -> padX + pitchPlotWidth
  const toSvgX = (xMeters) => padX + (Math.max(0, Math.min(20.12, xMeters)) / 20.12) * pitchPlotWidth;

  // In top-view, Y = 0 (crease left) -> padY, Y = 2.64 -> padY + pitchPlotHeight
  const toSvgYTop = (yMeters = 1.32) => {
    const clampedY = Math.max(0, Math.min(2.64, yMeters));
    return padY + (clampedY / 2.64) * pitchPlotHeight;
  };

  // In side-view, Z = 0 (ground) -> padY + pitchPlotHeight, Z = 2.5m (head) -> padY
  const toSvgYSide = (zMeters = 0) => {
    const maxZ = 2.5;
    const clampedZ = Math.max(0, Math.min(maxZ, zMeters));
    return padY + pitchPlotHeight - (clampedZ / maxZ) * pitchPlotHeight;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-[#8a9ab0] uppercase tracking-wider">
          Pitch Map & Bounce Distribution
        </span>
        <div className="flex bg-[#182231] p-0.5 rounded-lg border border-[#243146] text-xs">
          <button
            onClick={() => setCurrentView('top')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
              currentView === 'top' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            Top-Down
          </button>
          <button
            onClick={() => setCurrentView('side')}
            className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
              currentView === 'side' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            Side Flight
          </button>
        </div>
      </div>

      <div className="relative w-full bg-[#0b0f14] border border-[#243146] rounded-xl overflow-hidden shadow-inner p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: '240px' }}
        >
          {/* Pitch surface rectangle */}
          {currentView === 'top' ? (
            <rect
              x={padX}
              y={padY}
              width={pitchPlotWidth}
              height={pitchPlotHeight}
              fill="#2a2216"
              stroke="#524330"
              strokeWidth="2"
              rx="4"
            />
          ) : (
            <>
              {/* Sky / Side ground line */}
              <line
                x1={padX}
                y1={toSvgYSide(0)}
                x2={padX + pitchPlotWidth}
                y2={toSvgYSide(0)}
                stroke="#2fd27e"
                strokeWidth="3"
              />
              <rect
                x={padX}
                y={toSvgYSide(0)}
                width={pitchPlotWidth}
                height={svgHeight - toSvgYSide(0)}
                fill="#182231"
              />
            </>
          )}

          {/* Length Zones Bands (colored overlays near striker end) */}
          {DEFAULT_LENGTH_ZONES.map((zone) => {
            if (zone.id === 'full-toss') return null;
            const xFar = Math.max(0, 20.12 - (isFinite(zone.max) ? zone.max : 12));
            const xNear = Math.max(0, 20.12 - zone.min);

            const svgX1 = toSvgX(xFar);
            const svgX2 = toSvgX(xNear);
            const width = Math.max(0, svgX2 - svgX1);

            return (
              <g key={zone.id}>
                <rect
                  x={svgX1}
                  y={padY}
                  width={width}
                  height={pitchPlotHeight}
                  fill={zone.color}
                  fillOpacity="0.12"
                  stroke={zone.color}
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />
                <text
                  x={svgX1 + width / 2}
                  y={padY - 8}
                  fill={zone.color}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {zone.name}
                </text>
              </g>
            );
          })}

          {/* Bowler End Creases & Stumps (X = 0) */}
          {currentView === 'top' ? (
            <>
              {/* Bowling crease line */}
              <line
                x1={toSvgX(0)}
                y1={padY}
                x2={toSvgX(0)}
                y2={padY + pitchPlotHeight}
                stroke="#e8eef5"
                strokeWidth="2"
              />
              {/* Popping crease 1.22m forward */}
              <line
                x1={toSvgX(1.22)}
                y1={padY - 8}
                x2={toSvgX(1.22)}
                y2={padY + pitchPlotHeight + 8}
                stroke="#e8eef5"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* 3 Stumps */}
              <circle cx={toSvgX(0)} cy={toSvgYTop(1.32)} r="4" fill="#ffb020" />
            </>
          ) : (
            <>
              {/* Bowler Stumps vertical bar (0.711m) */}
              <line
                x1={toSvgX(0)}
                y1={toSvgYSide(0)}
                x2={toSvgX(0)}
                y2={toSvgYSide(0.711)}
                stroke="#ffb020"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Popping crease mark */}
              <line
                x1={toSvgX(1.22)}
                y1={toSvgYSide(0)}
                x2={toSvgX(1.22)}
                y2={toSvgYSide(0) + 8}
                stroke="#e8eef5"
                strokeWidth="2"
              />
            </>
          )}

          {/* Striker End Creases & Stumps (X = 20.12) */}
          {currentView === 'top' ? (
            <>
              {/* Bowling crease */}
              <line
                x1={toSvgX(20.12)}
                y1={padY}
                x2={toSvgX(20.12)}
                y2={padY + pitchPlotHeight}
                stroke="#e8eef5"
                strokeWidth="2"
              />
              {/* Popping crease 1.22m in front */}
              <line
                x1={toSvgX(20.12 - 1.22)}
                y1={padY - 8}
                x2={toSvgX(20.12 - 1.22)}
                y2={padY + pitchPlotHeight + 8}
                stroke="#e8eef5"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Stumps */}
              <circle cx={toSvgX(20.12)} cy={toSvgYTop(1.32)} r="4" fill="#ffb020" />
            </>
          ) : (
            <>
              {/* Striker Stumps (0.711m tall) */}
              <line
                x1={toSvgX(20.12)}
                y1={toSvgYSide(0)}
                x2={toSvgX(20.12)}
                y2={toSvgYSide(0.711)}
                stroke="#ffb020"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={toSvgX(20.12 - 1.22)}
                y1={toSvgYSide(0)}
                x2={toSvgX(20.12 - 1.22)}
                y2={toSvgYSide(0) + 8}
                stroke="#e8eef5"
                strokeWidth="2"
              />
            </>
          )}

          {/* Flight trajectory curve if selectedDelivery in side-view */}
          {currentView === 'side' && selectedDelivery && selectedDelivery.points && (
            <path
              d={selectedDelivery.points
                .filter((p) => p.X != null && p.Z != null)
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.X)} ${toSvgYSide(p.Z)}`)
                .join(' ')}
              fill="none"
              stroke="#c6ff3d"
              strokeWidth="2.5"
              strokeDasharray="none"
              opacity="0.85"
            />
          )}

          {/* Delivery Bounce Points */}
          {deliveries.map((del, idx) => {
            const xBounce = del.metrics?.xBounce;
            if (xBounce == null || isNaN(xBounce)) return null;

            const isSelected = selectedDelivery?.id === del.id;
            const cx = toSvgX(xBounce);
            const cy = currentView === 'top' ? toSvgYTop(del.metrics?.yBounce || 1.32) : toSvgYSide(PITCH.ballRadius);

            const spd = del.metrics?.speed?.mps || 30;
            // Color dot by speed: slow (yellow) -> fast (green) -> rocket (red/orange)
            const dotColor = spd > 38 ? '#e5473f' : spd > 33 ? '#c6ff3d' : '#ffb020';

            return (
              <g
                key={del.id || idx}
                onClick={() => onSelectDelivery?.(idx)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="none"
                    stroke="#c6ff3d"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? '7' : '5'}
                  fill={dotColor}
                  stroke="#0b0f14"
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={cy + (currentView === 'top' ? -10 : -12)}
                  fill="#e8eef5"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className={isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                >
                  {del.name || `B${idx + 1}`} ({Math.round(spd * 3.6)}k)
                </text>
              </g>
            );
          })}

          {/* Labels */}
          <text x={toSvgX(0)} y={svgHeight - 10} fill="#8a9ab0" fontSize="10" textAnchor="middle">
            Bowler End (0m)
          </text>
          <text x={toSvgX(20.12)} y={svgHeight - 10} fill="#8a9ab0" fontSize="10" textAnchor="middle">
            Striker End (20.12m)
          </text>
        </svg>
      </div>
    </div>
  );
}
