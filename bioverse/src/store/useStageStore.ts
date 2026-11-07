/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface StageState {
  selectedHotspot: string | null;
  cameraPosition: [number, number, number] | null;
  cameraTarget: [number, number, number] | null;
  exploded: number; // 0 (assembled) to 1 (fully separated)
  showLabels: boolean;
  highlightedParts: string[];
  resetCameraTrigger: number;
  isCinematic: boolean;

  setSelectedHotspot: (id: string | null) => void;
  setCameraFocus: (position: [number, number, number], target: [number, number, number]) => void;
  setExploded: (val: number) => void;
  setShowLabels: (show: boolean) => void;
  setHighlightedParts: (parts: string[]) => void;
  triggerResetCamera: () => void;
  toggleCinematic: () => void;
}

export const useStageStore = create<StageState>((set) => ({
  selectedHotspot: null,
  cameraPosition: null,
  cameraTarget: null,
  exploded: 0,
  showLabels: true,
  highlightedParts: [],
  resetCameraTrigger: 0,
  isCinematic: false,

  setSelectedHotspot: (selectedHotspot) => set({ selectedHotspot }),
  setCameraFocus: (cameraPosition, cameraTarget) => set({ cameraPosition, cameraTarget }),
  setExploded: (exploded) => set({ exploded }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setHighlightedParts: (highlightedParts) => set({ highlightedParts }),
  triggerResetCamera: () => set((state) => ({ resetCameraTrigger: state.resetCameraTrigger + 1 })),
  toggleCinematic: () => set((state) => ({ isCinematic: !state.isCinematic })),
}));
