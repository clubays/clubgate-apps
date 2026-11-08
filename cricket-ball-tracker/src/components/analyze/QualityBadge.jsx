import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function QualityBadge({ gradeObj, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const grade = gradeObj?.grade || 'D';
  const label = gradeObj?.label || 'Indicative only';
  const reasons = gradeObj?.reasons || [];

  const gradeStyles = {
    A: 'bg-[#2fd27e] text-[#0b0f14] border-[#2fd27e]',
    B: 'bg-[#c6ff3d] text-[#0b0f14] border-[#c6ff3d]',
    C: 'bg-[#ffb020] text-[#0b0f14] border-[#ffb020]',
    D: 'bg-[#e5473f] text-white border-[#e5473f]',
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border cursor-pointer select-none transition-transform active:scale-95 ${gradeStyles[grade]}`}
        title="Click to view precision details"
      >
        <span>GRADE {grade}</span>
        <HelpCircle className="w-3.5 h-3.5 opacity-75" />
      </div>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 bg-[#121923] border border-[#243146] rounded-xl shadow-2xl text-xs text-[#e8eef5]">
          <div className="font-bold flex items-center justify-between border-b border-[#243146] pb-1.5 mb-2">
            <span>Quality Rating: Grade {grade}</span>
            <span className="text-[10px] text-[#8a9ab0]">{label}</span>
          </div>

          <div className="space-y-1 text-[#8a9ab0]">
            {reasons.length > 0 ? (
              reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-[#ffb020]">•</span>
                  <span>{r}</span>
                </div>
              ))
            ) : (
              <p className="text-[#2fd27e]">High precision video capture and regression fit.</p>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#243146] text-[10px] text-[#8a9ab0]">
            Grade criteria: A (200+ fps, RMS &lt; 5cm), B (100+ fps), C (50+ fps), D (low fps).
          </div>
        </div>
      )}
    </div>
  );
}
