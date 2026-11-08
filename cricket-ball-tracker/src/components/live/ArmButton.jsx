import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

export default function ArmButton({ isArmed, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`h-16 px-8 rounded-2xl font-condensed text-2xl font-bold tracking-wider flex items-center justify-center gap-3 transition-all select-none shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        isArmed
          ? 'bg-[#e5473f] hover:brightness-110 text-white animate-pulse'
          : 'bg-[#c6ff3d] hover:brightness-110 text-[#0b0f14]'
      }`}
    >
      {isArmed ? (
        <>
          <ShieldAlert className="w-7 h-7" />
          <span>SPEED GUN ARMED (LISTENING)</span>
        </>
      ) : (
        <>
          <Zap className="w-7 h-7 fill-current" />
          <span>ARM SPEED GUN</span>
        </>
      )}
    </button>
  );
}
