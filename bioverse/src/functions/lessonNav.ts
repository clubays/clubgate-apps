/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson } from '@/types';

export function getLessonNav(
  currentLessonId: string,
  lessons: Lesson[]
): {
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentIndex: number;
  totalLessons: number;
} {
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  if (currentIndex === -1) {
    return {
      prevLesson: null,
      nextLesson: null,
      currentIndex: -1,
      totalLessons: lessons.length,
    };
  }

  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return {
    prevLesson,
    nextLesson,
    currentIndex,
    totalLessons: lessons.length,
  };
}
