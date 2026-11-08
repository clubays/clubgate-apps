import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';

export default function LiveHud({
  fps,
  trackerState = 'idle', // 'idle' | 'tracking' | 'complete'
  recentDeliveries = [],
  isLargeMode = false,
  onToggleLargeMode,
}) {
  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  const stateColors = {
    idle: 'bg-[#8a9ab0] text-[#0b0f14]',
    tracking: 'bg-[#c6ff3d] text-[#0b0f14] animate-pulse',
    complete: 'bg-[#2fd27e] text-[#0b0f14]',
  };

  const stateLabels = {
    idle: 'READY',
    tracking: 'TRACKING BALL...',
    complete: 'BALL RECORDED',
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-[#121923] border border-[#243146] rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-md font-bold tracking-wider text-[11px] ${
              stateColors[trackerState] || stateColors.idle
            }`}
          >
            {stateLabels[trackerState] || 'READY'}
          </span>

          <div className="text-[#8a9ab0] flex items-center gap-1 font-mono">
            <span>Camera:</span>
            <strong className="text-[#e8eef5]">{Math.round(fps)} fps</strong>
          </div>
        </div>

        <button
          onClick={onToggleLargeMode}
          className={`px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
            isLargeMode
              ? 'bg-[#c6ff3d] text-[#0b0f14] border-[#c6ff3d]'
              : 'bg-[#182231] text-[#8a9ab0] hover:text-[#e8eef5] border-[#243146]'
          }`}
        >
          {isLargeMode ? 'Exit Pitch Display' : 'Pitch Display (160px)'}
        </button>
      </div>

      {/* Last 6 Deliveries as Chips */}
      {recentDeliveries.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-[#8a9ab0] uppercase shrink-0">
            Recent:
          </span>
          {recentDeliveries.slice(-6).map((del, idx) => {
            const spd = del.metrics?.speed?.mps ? Math.round(toUnit(del.metrics.speed.mps)) : '—';
            return (
              <div
                key={del.id || idx}
                className="px-2.5 py-1 rounded-lg bg-[#182231] border border-[#243146] text-xs flex items-center gap-1.5 shrink-0"
              >
                <span className="text-[#8a9ab0] font-bold">#{idx + 1}</span>
                <span className="font-mono font-bold text-[#c6ff3d]">
                  {spd} {unitLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
