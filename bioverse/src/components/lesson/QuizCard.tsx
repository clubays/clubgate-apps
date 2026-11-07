/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuizCardProps {
  questions: QuizQuestion[];
  onFinish?: (scorePercent: number) => void;
  bestScore?: number;
}

export function QuizCard({ questions, onFinish, bestScore }: QuizCardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center text-stone-500">
        No quiz questions available for this lesson.
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const hasAnsweredCurrent = selectedAnswers[currentIdx] !== undefined;
  const isCurrentSubmitted = isSubmitted[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setIsSubmitted((prev) => ({ ...prev, [currentIdx]: true }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Calculate score
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.answerIndex) correct++;
      });
      const percent = Math.round((correct / questions.length) * 100);
      onFinish?.(percent);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted({});
    setIsFinished(false);
  };

  if (isFinished) {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) correct++;
    });
    const percent = Math.round((correct / questions.length) * 100);
    const passed = percent >= 70;

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md',
            passed
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          )}
        >
          <Award size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          {passed ? 'Great Job!' : 'Keep Practicing!'}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          You scored <strong className="text-stone-900 dark:text-stone-100">{percent}%</strong> ({correct}/{questions.length} correct)
          {bestScore !== undefined && bestScore > 0 && (
            <span className="block text-xs text-stone-500 mt-1">
              Personal best: {bestScore}%
            </span>
          )}
        </p>
        <Button variant="outline" size="sm" onClick={handleRestart}>
          <RotateCcw size={16} />
          Retry Quiz
        </Button>
      </div>
    );
  }

  const selectedOpt = selectedAnswers[currentIdx];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center text-xs font-mono text-stone-500 mb-3">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        {bestScore !== undefined && bestScore > 0 && (
          <span>Best: {bestScore}%</span>
        )}
      </div>

      <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">
        {currentQ.prompt}
      </h4>

      <div className="space-y-2 mb-4">
        {currentQ.options.map((option, optIdx) => {
          const isSelected = selectedOpt === optIdx;
          const isCorrect = optIdx === currentQ.answerIndex;

          let btnStyle = 'border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200';
          if (isCurrentSubmitted) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
            } else if (isSelected) {
              btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
            } else {
              btnStyle = 'opacity-50 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900';
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isCurrentSubmitted}
              onClick={() => handleSelectOption(optIdx)}
              className={cn(
                'w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start justify-between gap-2 cursor-pointer disabled:cursor-default',
                btnStyle
              )}
            >
              <span>{option}</span>
              {isCurrentSubmitted && isCorrect && (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              {isCurrentSubmitted && isSelected && !isCorrect && (
                <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {isCurrentSubmitted && (
        <div className="p-3 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-xs sm:text-sm text-stone-700 dark:text-stone-300 mb-4 animate-in fade-in duration-150">
          <strong>Explanation: </strong>
          {currentQ.explanation}
        </div>
      )}

      <div className="mt-auto pt-3 flex justify-end border-t border-stone-200 dark:border-stone-800">
        <Button
          size="sm"
          disabled={!hasAnsweredCurrent}
          onClick={handleNext}
        >
          {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}
