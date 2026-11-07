/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateOverallProgress, calculateUnitProgress, getNextUncompletedLesson } from '@/functions/progress';
import { Unit, Lesson } from '@/types';

describe('Course Progress Math', () => {
  it('calculates overall percentage correctly', () => {
    expect(calculateOverallProgress(16, [])).toBe(0);
    expect(calculateOverallProgress(16, ['l1', 'l2', 'l3', 'l4'])).toBe(0.25);
    expect(calculateOverallProgress(16, Array(16).fill('l'))).toBe(1.0);
  });

  it('calculates unit progress correctly', () => {
    const mockUnit: Unit = {
      id: 'unit-1',
      order: 1,
      title: 'Unit 1',
      subtitle: 'Sub',
      description: 'Desc',
      iconName: 'Shapes',
      color: '#000',
      lessonIds: ['l1', 'l2', 'l3', 'l4'],
    };

    expect(calculateUnitProgress(mockUnit, [])).toBe(0);
    expect(calculateUnitProgress(mockUnit, ['l1', 'l2'])).toBe(0.5);
    expect(calculateUnitProgress(mockUnit, ['l1', 'l2', 'l3', 'l4'])).toBe(1.0);
  });

  it('resolves the next uncompleted lesson in order', () => {
    const mockLessons = [
      { id: 'l1', title: 'Lesson 1' },
      { id: 'l2', title: 'Lesson 2' },
      { id: 'l3', title: 'Lesson 3' },
    ] as Lesson[];

    expect(getNextUncompletedLesson(mockLessons, [])?.id).toBe('l1');
    expect(getNextUncompletedLesson(mockLessons, ['l1'])?.id).toBe('l2');
    expect(getNextUncompletedLesson(mockLessons, ['l1', 'l2'])?.id).toBe('l3');
    expect(getNextUncompletedLesson(mockLessons, ['l1', 'l2', 'l3'])?.id).toBe('l1');
  });
});
