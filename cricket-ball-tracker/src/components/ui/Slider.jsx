import React from 'react';

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  unit = '',
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-[#8a9ab0]">
          <span>{label}</span>
          <span className="font-mono text-[#e8eef5]">
            {value} {unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-[#243146] rounded-lg appearance-none cursor-pointer accent-[#c6ff3d]"
      />
    </div>
  );
}
