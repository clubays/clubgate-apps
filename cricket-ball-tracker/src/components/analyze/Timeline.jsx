import React, { useRef, useState } from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { formatTime } from '../../utils/time.js';

export default function Timeline({ videoRef }) {
  const duration = useAnalysisStore((s) => s.duration);
  const currentTime = useAnalysisStore((s) => s.currentTime);
  const setCurrentTime = useAnalysisStore((s) => s.setCurrentTime);
  const deliveries = useAnalysisStore((s) => s.deliveries);
  const selectedDeliveryIdx = useAnalysisStore((s) => s.selectedDeliveryIdx);
  const selectDelivery = useAnalysisStore((s) => s.selectDelivery);
  const updateDeliveryMarkers = useAnalysisStore((s) => s.updateDeliveryMarkers);

  const containerRef = useRef(null);
  const [draggingMarker, setDraggingMarker] = useState(null); // 'release' | 'bounce' | null

  const selectedDelivery = deliveries[selectedDeliveryIdx] || null;

  const seekToRatio = (ratio) => {
    if (!videoRef?.current || duration <= 0) return;
    const newT = Math.max(0, Math.min(duration, ratio * duration));
    videoRef.current.currentTime = newT;
    setCurrentTime(newT);
  };

  const handlePointerDown = (e) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekToRatio(ratio);
  };

  const handleMarkerDrag = (markerType, e) => {
    e.stopPropagation();
    setDraggingMarker(markerType);

    const onPointerMove = (moveEvt) => {
      if (!containerRef.current || duration <= 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newT = Math.max(0, Math.min(duration, ((moveEvt.clientX - rect.left) / rect.width) * duration));

      if (markerType === 'release') {
        updateDeliveryMarkers(newT, undefined);
      } else if (markerType === 'bounce') {
        updateDeliveryMarkers(undefined, newT);
      }
    };

    const onPointerUp = () => {
      setDraggingMarker(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const currentPlayheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timeline-bar select-none">
      <div className="flex items-center justify-between text-[11px] text-[#8a9ab0] mb-1">
        <span>Timeline & Deliveries</span>
        <span className="font-mono text-[#e8eef5]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Main interactive scrubber strip */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative h-10 w-full bg-[#0b0f14] border border-[#243146] rounded-lg cursor-pointer overflow-hidden flex items-center"
      >
        {/* Delivery range coloured blocks */}
        {deliveries.map((del, idx) => {
          if (duration <= 0) return null;
          const leftPct = (del.tStart / duration) * 100;
          const widthPct = Math.max(1.5, ((del.tEnd - del.tStart) / duration) * 100);
          const isSelected = selectedDeliveryIdx === idx;

          return (
            <div
              key={del.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                selectDelivery(idx);
                seekToRatio(del.tStart / duration);
              }}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              className={`absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-bold transition-colors border-x ${
                isSelected
                  ? 'bg-[#c6ff3d]/25 border-[#c6ff3d] text-[#c6ff3d]'
                  : 'bg-[#182231] hover:bg-[#243146] border-[#243146] text-[#8a9ab0]'
              }`}
            >
              {del.name || `B${idx + 1}`}
            </div>
          );
        })}

        {/* Release Marker for selected delivery */}
        {selectedDelivery && selectedDelivery.tRelease && duration > 0 && (
          <div
            style={{ left: `${(selectedDelivery.tRelease / duration) * 100}%` }}
            onPointerDown={(e) => handleMarkerDrag('release', e)}
            className="absolute top-0 bottom-0 w-3 -translate-x-1/2 flex flex-col items-center justify-between z-30 cursor-ew-resize group"
            title="Release point (Drag to adjust)"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#2fd27e] border border-[#0b0f14]" />
            <div className="w-0.5 h-full bg-[#2fd27e]" />
            <span className="text-[9px] font-bold text-[#2fd27e] bg-[#0b0f14]/80 px-0.5 rounded -mb-1">
              R
            </span>
          </div>
        )}

        {/* Bounce Marker for selected delivery */}
        {selectedDelivery && selectedDelivery.tBounce && duration > 0 && (
          <div
            style={{ left: `${(selectedDelivery.tBounce / duration) * 100}%` }}
            onPointerDown={(e) => handleMarkerDrag('bounce', e)}
            className="absolute top-0 bottom-0 w-3 -translate-x-1/2 flex flex-col items-center justify-between z-30 cursor-ew-resize group"
            title="Bounce point (Drag to adjust)"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffb020] border border-[#0b0f14]" />
            <div className="w-0.5 h-full bg-[#ffb020]" />
            <span className="text-[9px] font-bold text-[#ffb020] bg-[#0b0f14]/80 px-0.5 rounded -mb-1">
              B
            </span>
          </div>
        )}

        {/* Current playback needle */}
        <div
          style={{ left: `${currentPlayheadPct}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-[#e8eef5] z-40 pointer-events-none shadow-sm"
        >
          <div className="w-2.5 h-2.5 bg-[#e8eef5] rotate-45 -translate-x-[4px] -translate-y-1 rounded-xs" />
        </div>
      </div>
    </div>
  );
}
