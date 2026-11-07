/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';
import { en } from '@/data/i18n/en';
import { he } from '@/data/i18n/he';

export type ThemeMode = 'paper' | 'lab';
export type Language = 'en' | 'he';

export interface SettingsState {
  theme: ThemeMode;
  language: Language;
  reduceMotion: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setReduceMotion: (reduce: boolean) => void;
  t: (key: keyof typeof en, params?: Record<string, string | number>) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'paper',
      language: 'en',
      reduceMotion: false,

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'lab') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const next = get().theme === 'paper' ? 'lab' : 'paper';
        get().setTheme(next);
      },

      setLanguage: (language: Language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
          document.documentElement.lang = language;
        }
      },

      setReduceMotion: (reduceMotion: boolean) => {
        set({ reduceMotion });
      },

      t: (key, params) => {
        const lang = get().language;
        const dict = lang === 'he' ? he : en;
        let str = dict[key] || en[key] || key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          }
        }
        return str;
      },
    }),
    {
      name: 'bioverse:settings:v1',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
