import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '@/constants';
import { Settings, ThemeMode, UnitSystem } from '@/types';

interface SettingsState extends Settings {
  setUnits: (units: UnitSystem) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setBallPreset: (presetId: string) => void;
  setCustomHsv: (hsv: Settings['customHsv']) => void;
  setSensitivity: (sens: number) => void;
  setWorkWidth: (w: 320 | 480 | 640) => void;
  setMinSpeedKmh: (kmh: number) => void;
  setCooldownSeconds: (sec: number) => void;
  setBeep: (v: boolean) => void;
  setVibration: (v: boolean) => void;
  setSpeech: (v: boolean) => void;
  setPreferredCameraId: (id: string | undefined) => void;
  setPreferredResolution: (res: '720p' | '1080p') => void;
  setTargetFps: (fps: 30 | 60 | 120) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setUnits: (units) => set({ units }),

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'day') {
            document.documentElement.setAttribute('data-theme', 'day');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      },

      toggleTheme: () => {
        const next = get().theme === 'night' ? 'day' : 'night';
        get().setTheme(next);
      },

      setBallPreset: (ballPreset) => set({ ballPreset }),
      setCustomHsv: (customHsv) => set({ customHsv }),
      setSensitivity: (sensitivity) => set({ sensitivity }),
      setWorkWidth: (workWidth) => set({ workWidth }),
      setMinSpeedKmh: (minSpeedKmh) => set({ minSpeedKmh }),
      setCooldownSeconds: (cooldownSeconds) => set({ cooldownSeconds }),
      setBeep: (beep) => set({ beep }),
      setVibration: (vibration) => set({ vibration }),
      setSpeech: (speech) => set({ speech }),
      setPreferredCameraId: (preferredCameraId) => set({ preferredCameraId }),
      setPreferredResolution: (preferredResolution) => set({ preferredResolution }),
      setTargetFps: (targetFps) => set({ targetFps }),
    }),
    {
      name: 'pacelab_settings',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          if (state.theme === 'day') {
            document.documentElement.setAttribute('data-theme', 'day');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      },
    }
  )
);
