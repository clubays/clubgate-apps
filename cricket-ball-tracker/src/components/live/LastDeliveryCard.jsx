import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';
import QualityBadge from '../analyze/QualityBadge.jsx';

export default function LastDeliveryCard({ delivery, isLargePitchMode = false }) {
  const units = useSettingsStore((s) => s.units);
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  if (!delivery) {
    return (
      <div className="card-panel p-6 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold text-[#8a9ab0] uppercase tracking-wider mb-2">
          Waiting for next delivery...
        </span>
        <div className="font-condensed text-7xl font-bold text-[#243146]">000</div>
        <span className="text-xs text-[#8a9ab0] mt-2">
          Bowl from bowler's end towards the calibrated striker stumps
        </span>
      </div>
    );
  }

  const mps = delivery.metrics?.speed?.mps;
  const sdMps = delivery.metrics?.speed?.sd;
  const spd = mps ? toUnit(mps) : null;
  const sd = sdMps ? toUnit(sdMps) : null;

  const showDecimals = sd === null || sd < 1.5;
  const formattedSpd = spd != null ? (showDecimals ? spd.toFixed(1) : Math.round(spd).toString()) : '—';
  const formattedSd = sd != null ? (sd < 1.5 ? sd.toFixed(1) : Math.round(sd).toString()) : null;

  const zone = delivery.metrics?.lengthZone?.name || 'Good length';
  const zoneColor = delivery.metrics?.lengthZone?.color || '#c6ff3d';

  return (
    <div className="card-panel-elevated p-6 flex flex-col justify-between border-2 border-[#243146] relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#8a9ab0] uppercase tracking-wider">
          {delivery.name || 'Latest Delivery'}
        </span>
        {delivery.grade && <QualityBadge gradeObj={delivery.grade} />}
      </div>

      {/* Speed Typography */}
      <div className="my-3">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-condensed font-bold tracking-tight text-[#c6ff3d] leading-none ${
              isLargePitchMode ? 'text-[120px] md:text-[180px]' : 'text-[88px] md:text-[110px]'
            }`}
          >
            {formattedSpd}
          </span>
          <span className="font-condensed font-bold text-3xl md:text-4xl text-[#e8eef5]">
            {unitLabel}
          </span>
        </div>

        {formattedSd && (
          <div className="text-xs text-[#8a9ab0]">
            Confidence: <strong className="text-[#e8eef5]">±{formattedSd} {unitLabel}</strong>
          </div>
        )}
      </div>

      {/* Delivery attributes: Length Zone, Bounce height, Speed loss */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#243146] text-xs">
        <div className="p-2 rounded-lg bg-[#121923]">
          <span className="text-[10px] text-[#8a9ab0] block">LENGTH</span>
          <span className="font-bold text-sm" style={{ color: zoneColor }}>
            {zone}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#121923]">
          <span className="text-[10px] text-[#8a9ab0] block">BOUNCE</span>
          <span className="font-bold text-sm text-[#e8eef5]">
            {delivery.metrics?.lengthDist != null ? `${delivery.metrics.lengthDist.toFixed(1)}m` : 'Full toss'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#121923]">
          <span className="text-[10px] text-[#8a9ab0] block">LOSS</span>
          <span className="font-bold text-sm text-[#ffb020]">
            {delivery.metrics?.lossPct != null ? `${Math.round(delivery.metrics.lossPct)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
