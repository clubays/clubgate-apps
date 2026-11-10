import { create } from 'zustand';
import { Delivery, DeliveryState, Session, TrackPoint } from '@/types';

interface LiveState {
  currentSession: Session | null;
  state: DeliveryState;
  isArmed: boolean;
  showGates: boolean;
  isMuted: boolean;
  lastDelivery: Delivery | null;
  sessionDeliveries: Delivery[];
  currentFps: number;
  procMs: number;
  resolution: { width: number; height: number };
  activeCandidate?: { x: number; y: number; radius: number; confidence: number };
  activeTrack?: { points: TrackPoint[]; isConfirmed: boolean };

  // Actions
  setSession: (session: Session | null) => void;
  setState: (state: DeliveryState) => void;
  setArmed: (armed: boolean) => void;
  toggleArmed: () => void;
  setShowGates: (show: boolean) => void;
  toggleGates: () => void;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setTelemetry: (fps: number, procMs: number, resolution?: { width: number; height: number }) => void;
  setActiveCandidate: (cand?: { x: number; y: number; radius: number; confidence: number }) => void;
  setActiveTrack: (track?: { points: TrackPoint[]; isConfirmed: boolean }) => void;
  addDelivery: (delivery: Delivery) => void;
  resetSession: () => void;
}

export const useLiveStore = create<LiveState>((set, get) => ({
  currentSession: null,
  state: 'IDLE',
  isArmed: false,
  showGates: true,
  isMuted: false,
  lastDelivery: null,
  sessionDeliveries: [],
  currentFps: 0,
  procMs: 0,
  resolution: { width: 1280, height: 720 },

  setSession: (currentSession) => set({ currentSession }),
  setState: (state) => set({ state }),
  setArmed: (isArmed) => set({ isArmed }),
  toggleArmed: () => set({ isArmed: !get().isArmed }),
  setShowGates: (showGates) => set({ showGates }),
  toggleGates: () => set({ showGates: !get().showGates }),
  setIsMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set({ isMuted: !get().isMuted }),

  setTelemetry: (fps, procMs, resolution) => {
    set((s) => ({
      currentFps: fps,
      procMs,
      resolution: resolution || s.resolution,
    }));
  },

  setActiveCandidate: (activeCandidate) => set({ activeCandidate }),
  setActiveTrack: (activeTrack) => set({ activeTrack }),

  addDelivery: (delivery) => {
    set((s) => ({
      lastDelivery: delivery,
      sessionDeliveries: [...s.sessionDeliveries, delivery],
    }));
  },

  resetSession: () => {
    set({
      lastDelivery: null,
      sessionDeliveries: [],
      activeCandidate: undefined,
      activeTrack: undefined,
      state: get().isArmed ? 'ARMED' : 'IDLE',
    });
  },
}));
