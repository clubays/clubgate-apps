/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LESSONS } from '@/data/lessons';
import { LessonPanel } from '@/components/lesson/LessonPanel';
import { StageCanvas } from '@/components/stage/StageCanvas';
import { useProgressStore } from '@/store/useProgressStore';
import { useStageStore } from '@/store/useStageStore';
import { getLessonNav } from '@/functions/lessonNav';
import { ChevronLeft, ChevronRight, Layers, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const { setLastLessonId } = useProgressStore();
  const { isCinematic, setCameraFocus, setHighlightedParts, setSelectedHotspot } = useStageStore();

  const [simulationState, setSimulationState] = useState<any>(null);
  const [mobileTab, setMobileTab] = useState<'stage' | 'lesson'>('stage');

  const lesson = LESSONS.find((l) => l.id === lessonId);

  // If lesson not found, navigate to 404
  useEffect(() => {
    if (!lesson) {
      navigate('/404', { replace: true });
    } else {
      setLastLessonId(lesson.id);
      // Reset camera to default step or center
      const firstStep = lesson.steps[0];
      if (firstStep?.focus) {
        setCameraFocus(firstStep.focus.camera, firstStep.focus.target);
      } else {
        setCameraFocus([0, 1.5, 6.5], [0, 0, 0]);
      }
      setSelectedHotspot(null);
      setHighlightedParts(firstStep?.highlight || []);
    }
  }, [lesson, navigate, setLastLessonId, setCameraFocus, setSelectedHotspot, setHighlightedParts]);

  if (!lesson) return null;

  const { prevLesson, nextLesson } = getLessonNav(lesson.id, LESSONS);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-stone-100 dark:bg-stone-950">
      {/* Mobile Tab Switcher (Stage vs Lesson) */}
      <div className="lg:hidden flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
        <button
          onClick={() => setMobileTab('stage')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors',
            mobileTab === 'stage'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          )}
        >
          3D Interactive Model
        </button>
        <button
          onClick={() => setMobileTab('lesson')}
          className={cn(
            'flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors',
            mobileTab === 'lesson'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          )}
        >
          Lesson Guide & Quiz
        </button>
      </div>

      {/* Main Workstation Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Center / Left: 3D Stage Viewport */}
        <div
          className={cn(
            'flex-1 h-full min-h-0 relative transition-all duration-300',
            isCinematic ? 'w-full' : 'lg:w-[58%] xl:w-[62%]',
            mobileTab === 'stage' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <StageCanvas
            modelId={lesson.modelId}
            hotspots={lesson.hotspots}
            simulationState={simulationState}
          />
        </div>

        {/* Right Panel: Interactive Guided Lesson Guide */}
        <div
          className={cn(
            'h-full min-h-0 border-l border-stone-200 dark:border-stone-800 transition-all duration-300 z-20',
            isCinematic ? 'hidden' : 'w-full lg:w-[42%] xl:w-[38%] flex flex-col',
            mobileTab === 'lesson' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <LessonPanel
            lesson={lesson}
            onSimulationUpdate={setSimulationState}
          />
        </div>
      </div>

      {/* Footer Navigation Bar across lessons */}
      <div className="h-11 px-4 border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs flex items-center justify-between text-xs shrink-0 select-none z-30">
        {prevLesson ? (
          <Link
            to={`/lesson/${prevLesson.id}`}
            className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-amber-600 font-medium transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev:</span>
            <span className="truncate max-w-[140px] sm:max-w-xs">{prevLesson.title}</span>
          </Link>
        ) : (
          <span className="text-stone-400 flex items-center gap-1 text-[11px]">
            First Lesson
          </span>
        )}

        <div className="text-stone-400 font-mono text-[11px] hidden md:block">
          Lesson {lesson.order} of {LESSONS.length}
        </div>

        {nextLesson ? (
          <Link
            to={`/lesson/${nextLesson.id}`}
            className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 hover:text-amber-600 font-medium transition-colors"
          >
            <span className="hidden sm:inline">Next:</span>
            <span className="truncate max-w-[140px] sm:max-w-xs">{nextLesson.title}</span>
            <ChevronRight size={16} />
          </Link>
        ) : (
          <Link
            to="/lessons"
            className="flex items-center gap-1 text-emerald-600 font-medium"
          >
            Finish Course
          </Link>
        )}
      </div>
    </div>
  );
}
