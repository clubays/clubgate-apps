import React from 'react';
import { X, Check } from 'lucide-react';
import { BALL_PRESETS } from '../../data/ballPresets.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';

export default function SettingsDrawer({ isOpen, onClose }) {
  const units = useSettingsStore((s) => s.units);
  const setUnits = useSettingsStore((s) => s.setUnits);
  const ballPreset = useSettingsStore((s) => s.ballPreset);
  const setBallPreset = useSettingsStore((s) => s.setBallPreset);
  const showDebugGate = useSettingsStore((s) => s.showDebugGate);
  const setShowDebugGate = useSettingsStore((s) => s.setShowDebugGate);
  const showPitchGrid = useSettingsStore((s) => s.showPitchGrid);
  const setShowPitchGrid = useSettingsStore((s) => s.setShowPitchGrid);
  const keepVideoBlob = useSettingsStore((s) => s.keepVideoBlob);
  const setKeepVideoBlob = useSettingsStore((s) => s.setKeepVideoBlob);
  const workingSize = useSettingsStore((s) => s.workingSize);
  const setWorkingSize = useSettingsStore((s) => s.setWorkingSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#121923] border-l border-[#243146] h-full flex flex-col p-5 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#243146]">
          <h3 className="font-condensed text-xl font-bold text-[#e8eef5] tracking-wider">
            TRACKER SETTINGS
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8a9ab0] hover:text-[#e8eef5] rounded-lg hover:bg-[#182231]"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-6 text-sm text-[#e8eef5]">
          {/* Ball Color Preset */}
          <div>
            <label className="block text-xs font-bold text-[#8a9ab0] uppercase mb-2">
              Ball Colour Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(BALL_PRESETS).map((p) => {
                const isSelected = ballPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setBallPreset(p.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-[#c6ff3d] bg-[#182231] text-[#c6ff3d]'
                        : 'border-[#243146] bg-[#0b0f14] text-[#8a9ab0] hover:border-[#8a9ab0]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: p.colour }}
                      />
                      <span>{p.badge}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#8a9ab0] mt-1.5">
              Select your match ball type for HSV color segmentation and noise rejection.
            </p>
          </div>

          {/* Speed Units */}
          <div>
            <label className="block text-xs font-bold text-[#8a9ab0] uppercase mb-2">
              Speed Units
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#0b0f14] p-1 rounded-lg border border-[#243146]">
              <button
                onClick={() => setUnits('kmh')}
                className={`py-2 rounded-md font-bold text-xs ${
                  units === 'kmh' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0]'
                }`}
              >
                KM/H (Kilometres/h)
              </button>
              <button
                onClick={() => setUnits('mph')}
                className={`py-2 rounded-md font-bold text-xs ${
                  units === 'mph' ? 'bg-[#c6ff3d] text-[#0b0f14]' : 'text-[#8a9ab0]'
                }`}
              >
                MPH (Miles/h)
              </button>
            </div>
          </div>

          {/* Overlays and Visualisation */}
          <div className="space-y-3 pt-3 border-t border-[#243146]">
            <label className="block text-xs font-bold text-[#8a9ab0] uppercase">
              Display & Overlays
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Show 1m Pitch Metre Ruler Grid</span>
              <input
                type="checkbox"
                checked={showPitchGrid}
                onChange={(e) => setShowPitchGrid(e.target.checked)}
                className="w-4 h-4 accent-[#c6ff3d]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Show Kalman Gating Ellipse (Debug)</span>
              <input
                type="checkbox"
                checked={showDebugGate}
                onChange={(e) => setShowDebugGate(e.target.checked)}
                className="w-4 h-4 accent-[#c6ff3d]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Save Video in Session (uses storage)</span>
              <input
                type="checkbox"
                checked={keepVideoBlob}
                onChange={(e) => setKeepVideoBlob(e.target.checked)}
                className="w-4 h-4 accent-[#c6ff3d]"
              />
            </label>
          </div>

          {/* Processing Resolution */}
          <div className="pt-3 border-t border-[#243146]">
            <label className="block text-xs font-bold text-[#8a9ab0] uppercase mb-1.5">
              Worker Processing Size
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setWorkingSize(640)}
                className={`p-2 rounded-lg border font-semibold ${
                  workingSize === 640
                    ? 'border-[#c6ff3d] bg-[#182231] text-[#c6ff3d]'
                    : 'border-[#243146] text-[#8a9ab0]'
                }`}
              >
                640 px (Standard)
              </button>
              <button
                onClick={() => setWorkingSize(480)}
                className={`p-2 rounded-lg border font-semibold ${
                  workingSize === 480
                    ? 'border-[#c6ff3d] bg-[#182231] text-[#c6ff3d]'
                    : 'border-[#243146] text-[#8a9ab0]'
                }`}
              >
                480 px (Fast/Mobile)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
