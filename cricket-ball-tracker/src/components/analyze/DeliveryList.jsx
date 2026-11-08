import React from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';

export default function DeliveryList({ onSeekToTime }) {
  const deliveries = useAnalysisStore((s) => s.deliveries);
  const selectedDeliveryIdx = useAnalysisStore((s) => s.selectedDeliveryIdx);
  const selectDelivery = useAnalysisStore((s) => s.selectDelivery);

  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[#8a9ab0] bg-[#121923] border border-[#243146] rounded-xl">
        No balls segmented yet. Run analysis to detect deliveries.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-bold text-[#8a9ab0] uppercase">
        <span>Deliveries ({deliveries.length})</span>
        <span>Speed & Length</span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {deliveries.map((del, idx) => {
          const isSelected = selectedDeliveryIdx === idx;
          const spd = del.metrics?.speed?.mps ? Math.round(toUnit(del.metrics.speed.mps)) : '—';
          const zone = del.metrics?.lengthZone?.name || 'Length';
          const grade = del.grade?.grade || 'D';

          return (
            <button
              key={del.id || idx}
              onClick={() => {
                selectDelivery(idx);
                if (onSeekToTime && del.tStart != null) {
                  onSeekToTime(del.tStart);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                isSelected
                  ? 'border-[#c6ff3d] bg-[#182231] text-[#e8eef5]'
                  : 'border-[#243146] bg-[#121923] text-[#8a9ab0] hover:bg-[#182231] hover:text-[#e8eef5]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                    isSelected ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'bg-[#243146] text-[#e8eef5]'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{del.name || `Ball ${idx + 1}`}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b0f14] text-[#8a9ab0] border border-[#243146]">
                  {zone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#c6ff3d]">
                  {spd} {unitLabel}
                </span>
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                    grade === 'A'
                      ? 'bg-[#2fd27e] text-[#0b0f14]'
                      : grade === 'B'
                      ? 'bg-[#c6ff3d] text-[#0b0f14]'
                      : 'bg-[#ffb020] text-[#0b0f14]'
                  }`}
                >
                  {grade}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
