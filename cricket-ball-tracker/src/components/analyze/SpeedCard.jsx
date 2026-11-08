import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { mpsToKmh, mpsToMph } from '../../utils/units.js';
import QualityBadge from './QualityBadge.jsx';

export default function SpeedCard({ delivery, isLiveMode = false }) {
  const units = useSettingsStore((s) => s.units);
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  const mps = delivery?.metrics?.speed?.mps;
  const sdMps = delivery?.metrics?.speed?.sd;
  const targetVal = mps != null ? (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps)) : null;
  const sdVal = sdMps != null ? (units === 'mph' ? mpsToMph(sdMps) : mpsToKmh(sdMps)) : null;

  const [displayVal, setDisplayVal] = useState(targetVal || 0);

  // Animated count-up over 500ms
  useEffect(() => {
    if (targetVal === null) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayVal(targetVal);
      return;
    }

    const duration = 500;
    const startTime = performance.now();
    const startVal = Math.max(0, targetVal * 0.4);

    let animationFrame;
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const curr = startVal + (targetVal - startVal) * ease;
      setDisplayVal(curr);

      if (progress < 1.0) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayVal(targetVal);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetVal]);

  const showDecimals = sdVal === null || sdVal < 1.5;
  const formattedNumber = targetVal != null
    ? showDecimals
      ? displayVal.toFixed(1)
      : Math.round(displayVal).toString()
    : '—';

  const formattedSd = sdVal != null
    ? sdVal < 1.5
      ? sdVal.toFixed(1)
      : Math.round(sdVal).toString()
    : null;

  return (
    <div className="card-panel-elevated p-4 flex flex-col justify-between border-2 border-[#243146] shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#c6ff3d]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-bold text-[#8a9ab0] uppercase tracking-wider">
          Peak Release Speed
        </span>
        {delivery?.grade && <QualityBadge gradeObj={delivery.grade} />}
      </div>

      <div className="my-2 z-10">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-condensed font-bold tracking-tight text-[#c6ff3d] leading-none ${
              isLiveMode ? 'text-[110px] md:text-[160px]' : 'text-[72px] md:text-[84px]'
            }`}
          >
            {formattedNumber}
          </span>
          <span className="font-condensed font-bold text-2xl md:text-3xl text-[#e8eef5]">
            {unitLabel}
          </span>
        </div>

        {formattedSd && (
          <div className="text-xs font-medium text-[#8a9ab0] flex items-center gap-1.5 mt-1">
            <span>Regression Uncertainty:</span>
            <span className="font-mono text-[#e8eef5] font-bold">±{formattedSd} {unitLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
