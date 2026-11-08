import create from 'zustand';
import { deleteSession, getAllSessions, getSession, saveSession } from '../utils/storage.js';

export const useSessionsStore = create((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await getAllSessions();
      set({ sessions: list, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadSession: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const sess = await getSession(id);
      set({ currentSession: sess, isLoading: false });
      return sess;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  saveCurrentSession: async (sessionData) => {
    try {
      await saveSession(sessionData);
      set((state) => {
        const idx = state.sessions.findIndex((s) => s.id === sessionData.id);
        const updated = [...state.sessions];
        if (idx >= 0) {
          updated[idx] = sessionData;
        } else {
          updated.unshift(sessionData);
        }
        return { sessions: updated, currentSession: sessionData };
      });
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  removeSession: async (id) => {
    try {
      await deleteSession(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },
}));
