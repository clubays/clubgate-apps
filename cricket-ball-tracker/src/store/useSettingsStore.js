import create from 'zustand';
import { DEFAULT_LENGTH_ZONES } from '../data/lengthZones.js';

const SETTINGS_KEY = 'seam_speed_settings_v1';

function loadPersistedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    units: 'kmh', // 'kmh' | 'mph'
    ballPreset: 'red', // 'red' | 'white' | 'pink' | 'any'
    showDebugGate: false,
    showPitchGrid: true,
    keepVideoBlob: false,
    soundBeep: true,
    workingSize: 640,
    lengthZones: DEFAULT_LENGTH_ZONES,
  };
}

export const useSettingsStore = create((set, get) => ({
  ...loadPersistedSettings(),

  setUnits: (units) => {
    set({ units });
    get().save();
  },

  setBallPreset: (ballPreset) => {
    set({ ballPreset });
    get().save();
  },

  setShowDebugGate: (showDebugGate) => {
    set({ showDebugGate });
    get().save();
  },

  setShowPitchGrid: (showPitchGrid) => {
    set({ showPitchGrid });
    get().save();
  },

  setKeepVideoBlob: (keepVideoBlob) => {
    set({ keepVideoBlob });
    get().save();
  },

  setSoundBeep: (soundBeep) => {
    set({ soundBeep });
    get().save();
  },

  setWorkingSize: (workingSize) => {
    set({ workingSize });
    get().save();
  },

  setLengthZones: (lengthZones) => {
    set({ lengthZones });
    get().save();
  },

  save: () => {
    const state = get();
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          units: state.units,
          ballPreset: state.ballPreset,
          showDebugGate: state.showDebugGate,
          showPitchGrid: state.showPitchGrid,
          keepVideoBlob: state.keepVideoBlob,
          soundBeep: state.soundBeep,
          workingSize: state.workingSize,
          lengthZones: state.lengthZones,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },
}));
