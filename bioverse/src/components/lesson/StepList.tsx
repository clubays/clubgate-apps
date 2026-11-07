/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Step } from '@/types';
import { Button } from '@/components/ui/Button';
import { Callout } from './Callout';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StepListProps {
  steps: Step[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  onCompleteLesson: () => void;
  isCompleted: boolean;
}

export function StepList({
  steps,
  currentStepIndex,
  onSelectStep,
  onCompleteLesson,
  isCompleted,
}: StepListProps) {
  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Progress pill indicator dots */}
      <div className="flex items-center gap-1.5 mb-4">
        {steps.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => onSelectStep(idx)}
            className={cn(
              'h-2 rounded-full transition-all cursor-pointer',
              idx === currentStepIndex
                ? 'w-8 bg-amber-600'
                : idx < currentStepIndex
                ? 'w-3 bg-amber-300 dark:bg-amber-800'
                : 'w-3 bg-stone-200 dark:bg-stone-800'
            )}
            title={`Step ${idx + 1}: ${s.title}`}
            aria-label={`Step ${idx + 1}: ${s.title}`}
          />
        ))}
        <span className="ml-auto text-xs font-mono text-stone-500">
          {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Step Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
          {currentStep.body}
        </p>

        {currentStep.callout && (
          <Callout type={currentStep.callout.type} title={currentStep.callout.title}>
            {currentStep.callout.text}
          </Callout>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-200 dark:border-stone-800">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirst}
          onClick={() => onSelectStep(currentStepIndex - 1)}
        >
          <ChevronLeft size={16} />
          Back
        </Button>

        {isLast ? (
          <Button
            variant={isCompleted ? 'secondary' : 'primary'}
            size="sm"
            onClick={onCompleteLesson}
          >
            <Check size={16} />
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelectStep(currentStepIndex + 1)}
          >
            Next Step
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
