/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UNITS } from '@/data/units';
import { LESSONS } from '@/data/lessons';
import { useProgressStore } from '@/store/useProgressStore';
import { calculateOverallProgress, calculateUnitProgress } from '@/functions/progress';
import { Chip } from '@/components/ui/Chip';
import { ProgressRing } from '@/components/lesson/ProgressRing';
import { CheckCircle2, Clock, ArrowRight, Shapes, Dna, Zap, Activity } from 'lucide-react';
import { LessonLevel } from '@/types';
import { cn } from '@/utils/cn';

const UNIT_ICONS: Record<string, React.ReactNode> = {
  Shapes: <Shapes size={18} />,
  Dna: <Dna size={18} />,
  Zap: <Zap size={18} />,
  Activity: <Activity size={18} />,
};

export default function LessonsPage() {
  const { completedLessonIds, quizScores } = useProgressStore();
  const [levelFilter, setLevelFilter] = useState<'All' | LessonLevel>('All');

  const overallProgress = calculateOverallProgress(LESSONS.length, completedLessonIds);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            All Lessons
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Complete sequence of 16 interactive 3D biology lessons across four units.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/60 self-start sm:self-auto">
          {(['All', 'Beginner', 'Intermediate'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                levelFilter === level
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Unit Sections */}
      <div className="space-y-12">
        {UNITS.map((unit) => {
          const unitProgress = calculateUnitProgress(unit, completedLessonIds);
          let unitLessons = LESSONS.filter((l) => l.unit === unit.id);
          if (levelFilter !== 'All') {
            unitLessons = unitLessons.filter((l) => l.level === levelFilter);
          }

          if (unitLessons.length === 0) return null;

          return (
            <div key={unit.id} className="space-y-4">
              {/* Unit Header Banner */}
              <div className="flex items-center justify-between gap-4 pb-2 border-b-2" style={{ borderColor: `${unit.color}40` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${unit.color}18`, color: unit.color }}
                  >
                    {UNIT_ICONS[unit.iconName] || <Shapes size={18} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {unit.title}
                    </h2>
                    <span className="text-xs text-stone-500">
                      {unit.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProgressRing progress={unitProgress} size={28} strokeWidth={2.5} color={unit.color} />
                  <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400">
                    {Math.round(unitProgress * 100)}%
                  </span>
                </div>
              </div>

              {/* Lessons Grid in this Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unitLessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  const quizScore = quizScores[lesson.id];

                  return (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="group p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-stone-400 group-hover:text-amber-600 transition-colors">
                            #{lesson.order}
                          </span>
                          <div className="flex items-center gap-2">
                            <Chip
                              label={lesson.level}
                              variant={lesson.level === 'Beginner' ? 'teal' : 'amber'}
                              size="sm"
                            />
                            {isDone && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 size={14} />
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 font-serif leading-relaxed">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={13} />
                          {lesson.minutes} mins
                        </span>

                        <div className="flex items-center gap-2">
                          {quizScore !== undefined && (
                            <span className="font-mono text-[11px] text-stone-400">
                              Quiz: {quizScore}%
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                            Start <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
