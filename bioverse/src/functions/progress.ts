/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, Unit } from '@/types';

export function calculateOverallProgress(
  totalLessons: number,
  completedLessonIds: string[]
): number {
  if (totalLessons === 0) return 0;
  return Math.min(1, Math.max(0, completedLessonIds.length / totalLessons));
}

export function calculateUnitProgress(
  unit: Unit,
  completedLessonIds: string[]
): number {
  if (!unit.lessonIds.length) return 0;
  const completedInUnit = unit.lessonIds.filter((id) =>
    completedLessonIds.includes(id)
  ).length;
  return completedInUnit / unit.lessonIds.length;
}

export function getNextUncompletedLesson(
  lessons: Lesson[],
  completedLessonIds: string[]
): Lesson | null {
  for (const lesson of lessons) {
    if (!completedLessonIds.includes(lesson.id)) {
      return lesson;
    }
  }
  return lessons[0] || null;
}
