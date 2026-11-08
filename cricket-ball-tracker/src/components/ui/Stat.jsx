import React from 'react';

export default function Stat({ label, value, subtext, highlight = false, className = '' }) {
  return (
    <div
      className={`p-3 bg-[#182231] border border-[#243146] rounded-lg flex flex-col justify-between ${
        highlight ? 'border-[#c6ff3d]/50 bg-[#182231]' : ''
      } ${className}`}
    >
      <span className="text-[11px] font-semibold text-[#8a9ab0] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-xl font-bold ${highlight ? 'text-[#c6ff3d]' : 'text-[#e8eef5]'}`}>
          {value}
        </span>
        {subtext && <span className="text-xs text-[#8a9ab0]">{subtext}</span>}
      </div>
    </div>
  );
}
