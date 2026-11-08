import React from 'react';
import { Crosshair, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';

export default function ManualFixBar() {
  const isManualFixMode = useAnalysisStore((s) => s.isManualFixMode);
  const toggleManualFixMode = useAnalysisStore((s) => s.toggleManualFixMode);
  const currentTime = useAnalysisStore((s) => s.currentTime);
  const deleteDetectionAtTime = useAnalysisStore((s) => s.deleteDetectionAtTime);
  const deliveries = useAnalysisStore((s) => s.deliveries);
  const selectedDeliveryIdx = useAnalysisStore((s) => s.selectedDeliveryIdx);

  const selectedDelivery = deliveries[selectedDeliveryIdx];
  const hasPointAtCurrentTime = selectedDelivery?.points?.some(
    (p) => Math.abs(p.t - currentTime) < 0.035
  );

  return (
    <div
      className={`px-3 py-2 rounded-xl flex items-center justify-between border transition-all ${
        isManualFixMode
          ? 'bg-[#182231] border-[#c6ff3d] text-[#e8eef5] shadow-lg'
          : 'bg-[#121923] border-[#243146] text-[#8a9ab0]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleManualFixMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isManualFixMode
              ? 'bg-[#c6ff3d] text-[#0b0f14]'
              : 'bg-[#182231] text-[#e8eef5] hover:bg-[#243146]'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>{isManualFixMode ? 'MANUAL FIX ACTIVE' : 'MANUAL FIX (M)'}</span>
        </button>

        <span className="text-xs hidden sm:inline">
          {isManualFixMode
            ? 'Click the video on the ball to lock position (weight 3x). Press → to advance.'
            : 'Click to adjust individual frame detections if the ball was missed.'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isManualFixMode && hasPointAtCurrentTime && (
          <button
            onClick={() => deleteDetectionAtTime(currentTime)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#e5473f]/20 hover:bg-[#e5473f] text-[#e5473f] hover:text-white text-xs font-semibold transition-colors"
            title="Delete detection at current frame (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Pt</span>
          </button>
        )}

        {isManualFixMode && (
          <button
            onClick={toggleManualFixMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2fd27e] text-[#0b0f14] text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        )}
      </div>
    </div>
  );
}
