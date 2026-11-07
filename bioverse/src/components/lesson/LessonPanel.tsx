/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson } from '@/types';
import { GLOSSARY } from '@/data/glossary';
import { StepList } from './StepList';
import { QuizCard } from './QuizCard';
import { SimulationDock } from './SimulationDock';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle2, ChevronRight, BookOpen, Compass, HelpCircle, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useProgressStore } from '@/store/useProgressStore';
import { useStageStore } from '@/store/useStageStore';

interface LessonPanelProps {
  lesson: Lesson;
  onSimulationUpdate?: (state: any) => void;
}

type TabMode = 'learn' | 'explore' | 'quiz' | 'words';

export function LessonPanel({ lesson, onSimulationUpdate }: LessonPanelProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('learn');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { isLessonCompleted, markLessonComplete, recordQuizScore, quizScores } = useProgressStore();
  const { setSelectedHotspot, setCameraFocus, setHighlightedParts, selectedHotspot } = useStageStore();

  const isCompleted = isLessonCompleted(lesson.id);
  const bestQuizScore = quizScores[lesson.id];

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = lesson.steps[index];
    if (step) {
      if (step.focus) {
        setCameraFocus(step.focus.camera, step.focus.target);
      }
      if (step.highlight) {
        setHighlightedParts(step.highlight);
      } else {
        setHighlightedParts([]);
      }
    }
  };

  const handleHotspotClick = (hsId: string) => {
    setSelectedHotspot(hsId);
    const hs = lesson.hotspots.find((h) => h.id === hsId);
    if (hs) {
      // Focus camera slightly offset from hotspot
      const [hx, hy, hz] = hs.position;
      setCameraFocus([hx, hy + 0.5, hz + 3.2], [hx, hy, hz]);
      setHighlightedParts([hs.id]);
    }
  };

  const lessonGlossaryEntries = GLOSSARY.filter((g) =>
    lesson.glossary.includes(g.id)
  );

  return (
    <div className="flex flex-col h-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-l border-stone-200 dark:border-stone-800">
      {/* Lesson Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">
              Lesson {lesson.order}
            </span>
            <Chip
              label={lesson.level}
              variant={lesson.level === 'Beginner' ? 'teal' : 'amber'}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1 font-mono">
              <Clock size={13} />
              {lesson.minutes}m
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                Done
              </span>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
          {lesson.summary}
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-stone-100 dark:bg-stone-800/70 rounded-xl border border-stone-200/80 dark:border-stone-700/50">
          <button
            onClick={() => setActiveTab('learn')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
              activeTab === 'learn'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            )}
          >
            <BookOpen size={14} />
            <span>Learn</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
              activeTab === 'explore'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            )}
          >
            <Compass size={14} />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
              activeTab === 'quiz'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            )}
          >
            <HelpCircle size={14} />
            <span>Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('words')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
              activeTab === 'words'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            )}
          >
            <FileText size={14} />
            <span>Terms</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === 'learn' && (
          <StepList
            steps={lesson.steps}
            currentStepIndex={currentStepIndex}
            onSelectStep={handleSelectStep}
            onCompleteLesson={() => markLessonComplete(lesson.id)}
            isCompleted={isCompleted}
          />
        )}

        {activeTab === 'explore' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500 mb-2">
              Click any anatomical part below or directly on the 3D stage to focus the camera and view its function.
            </div>
            {lesson.hotspots.map((hs) => {
              const isSelected = selectedHotspot === hs.id;
              return (
                <div
                  key={hs.id}
                  onClick={() => handleHotspotClick(hs.id)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {hs.label}
                    </span>
                    <ChevronRight size={14} className="text-stone-400" />
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {hs.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'quiz' && (
          <QuizCard
            questions={lesson.quiz}
            bestScore={bestQuizScore}
            onFinish={(score) => recordQuizScore(lesson.id, score)}
          />
        )}

        {activeTab === 'words' && (
          <div className="space-y-3">
            <div className="text-xs text-stone-500 mb-2">
              Key biological vocabulary and mechanisms referenced throughout this lesson:
            </div>
            {lessonGlossaryEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {entry.term}
                  </span>
                  {entry.pronunciation && (
                    <span className="text-[11px] font-mono text-stone-500">
                      /{entry.pronunciation}/
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Docked Simulation View (Always accessible or when available) */}
      {lesson.simulationType && (
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <SimulationDock
            lesson={lesson}
            onSimulationStateUpdate={onSimulationUpdate}
          />
        </div>
      )}
    </div>
  );
}
