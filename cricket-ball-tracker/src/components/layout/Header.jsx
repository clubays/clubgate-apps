import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Activity, Camera, HelpCircle, History, Settings, Zap } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore.js';

export default function Header({ onOpenSettings }) {
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-[#182231] text-[#c6ff3d] border border-[#243146]'
        : 'text-[#8a9ab0] hover:text-[#e8eef5] hover:bg-[#182231]/50'
    }`;

  return (
    <header className="h-16 bg-[#0b0f14] border-b border-[#243146] px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#c6ff3d] flex items-center justify-center text-[#0b0f14] font-black group-hover:scale-105 transition-transform shadow-xs">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-condensed text-xl font-bold tracking-wider text-[#e8eef5] group-hover:text-[#c6ff3d] transition-colors">
              SEAM & SPEED
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#182231] text-[#8a9ab0] border border-[#243146]">
              CRICKET BALL TRACKER
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/analyze" className={navLinkClass}>
            <Activity className="w-4 h-4" />
            <span>Analyse</span>
          </NavLink>
          <NavLink to="/live" className={navLinkClass}>
            <Zap className="w-4 h-4 text-[#c6ff3d]" />
            <span>Live Speed Gun</span>
          </NavLink>
          <NavLink to="/sessions" className={navLinkClass}>
            <History className="w-4 h-4" />
            <span>Sessions</span>
          </NavLink>
          <NavLink to="/guide" className={navLinkClass}>
            <HelpCircle className="w-4 h-4" />
            <span>Setup Guide</span>
          </NavLink>
          <NavLink to="/selftest" className={navLinkClass}>
            <Camera className="w-4 h-4" />
            <span>Accuracy Test</span>
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Quick Unit Switcher */}
        <div className="flex items-center bg-[#182231] p-0.5 rounded-lg border border-[#243146] text-xs font-bold">
          <button
            onClick={() => setUnits('kmh')}
            className={`px-2 py-1 rounded-md transition-colors ${
              units === 'kmh' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            KM/H
          </button>
          <button
            onClick={() => setUnits('mph')}
            className={`px-2 py-1 rounded-md transition-colors ${
              units === 'mph' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            MPH
          </button>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#8a9ab0] hover:text-[#e8eef5] hover:bg-[#182231] rounded-lg transition-colors border border-transparent hover:border-[#243146]"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
