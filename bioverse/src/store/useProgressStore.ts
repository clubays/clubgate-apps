/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/utils/storage';

export interface ProgressState {
  completedLessonIds: string[];
  lastLessonId: string;
  quizScores: Record<string, number>; // lessonId -> percentage (0-100)
  markLessonComplete: (lessonId: string) => void;
  setLastLessonId: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, scorePercentage: number) => void;
  resetAllProgress: () => void;
  isLessonCompleted: (lessonId: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      lastLessonId: 'cell-intro',
      quizScores: {},

      markLessonComplete: (lessonId: string) => {
        set((state) => {
          if (state.completedLessonIds.includes(lessonId)) return state;
          return {
            completedLessonIds: [...state.completedLessonIds, lessonId],
            lastLessonId: lessonId,
          };
        });
      },

      setLastLessonId: (lessonId: string) => {
        set({ lastLessonId: lessonId });
      },

      recordQuizScore: (lessonId: string, scorePercentage: number) => {
        set((state) => {
          const current = state.quizScores[lessonId] || 0;
          return {
            quizScores: {
              ...state.quizScores,
              [lessonId]: Math.max(current, scorePercentage),
            },
          };
        });
      },

      resetAllProgress: () => {
        set({
          completedLessonIds: [],
          lastLessonId: 'cell-intro',
          quizScores: {},
        });
      },

      isLessonCompleted: (lessonId: string) => {
        return get().completedLessonIds.includes(lessonId);
      },
    }),
    {
      name: 'bioverse:v1',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
