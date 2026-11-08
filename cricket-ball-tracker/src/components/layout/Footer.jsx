import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Camera, HelpCircle, History, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  const mobileNavClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 px-1 text-[10px] font-semibold transition-colors flex-1 ${
      isActive ? 'text-[#c6ff3d]' : 'text-[#8a9ab0] hover:text-[#e8eef5]'
    }`;

  return (
    <>
      {/* Desktop footer notice */}
      <footer className="hidden md:flex h-10 bg-[#0b0f14] border-t border-[#243146] px-6 items-center justify-between text-xs text-[#8a9ab0] shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2fd27e]" />
          <span>Your video stays on this device. 100% in-browser Web Worker computer vision. No cloud uploads.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Stumps: 20.12 m (22 yds) • Height: 71.1 cm</span>
          <span>Constant-velocity Kalman filter</span>
        </div>
      </footer>

      {/* Mobile bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f14]/95 backdrop-blur-md border-t border-[#243146] flex items-center justify-around z-40 px-2">
        <NavLink to="/analyze" className={mobileNavClass}>
          <Activity className="w-5 h-5 mb-0.5" />
          <span>Analyse</span>
        </NavLink>
        <NavLink to="/live" className={mobileNavClass}>
          <Zap className="w-5 h-5 mb-0.5 text-[#c6ff3d]" />
          <span>Live Gun</span>
        </NavLink>
        <NavLink to="/sessions" className={mobileNavClass}>
          <History className="w-5 h-5 mb-0.5" />
          <span>Sessions</span>
        </NavLink>
        <NavLink to="/guide" className={mobileNavClass}>
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>Guide</span>
        </NavLink>
        <NavLink to="/selftest" className={mobileNavClass}>
          <Camera className="w-5 h-5 mb-0.5" />
          <span>Accuracy</span>
        </NavLink>
      </nav>
    </>
  );
}
