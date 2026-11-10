import { create } from 'zustand';
import { getLatestCalibration } from '@/db/calibrations';
import { Calibration } from '@/types';

interface CalibrationState {
  activeCalibration: Calibration | null;
  isLoading: boolean;
  setActiveCalibration: (calibration: Calibration | null) => void;
  loadActiveFromDB: () => Promise<Calibration | null>;
}

export const useCalibrationStore = create<CalibrationState>((set) => ({
  activeCalibration: null,
  isLoading: false,

  setActiveCalibration: (activeCalibration) => set({ activeCalibration }),

  loadActiveFromDB: async () => {
    set({ isLoading: true });
    try {
      const latest = await getLatestCalibration();
      set({ activeCalibration: latest || null, isLoading: false });
      return latest || null;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },
}));
