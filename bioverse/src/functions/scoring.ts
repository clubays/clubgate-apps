/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizQuestion } from '@/types';

export interface QuizGradeResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  itemResults: {
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizGradeResult {
  let score = 0;
  const itemResults = questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = selected === q.answerIndex;
    if (isCorrect) score++;
    return {
      questionId: q.id,
      selectedIndex: selected ?? -1,
      correctIndex: q.answerIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    passed: percentage >= 70,
    itemResults,
  };
}
