/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { UNITS } from '@/data/units';
import { LESSONS } from '@/data/lessons';
import { useProgressStore } from '@/store/useProgressStore';
import { calculateOverallProgress, calculateUnitProgress } from '@/functions/progress';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ProgressRing } from '@/components/lesson/ProgressRing';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Dna,
  Shapes,
  Activity,
  Layers,
  BookOpen,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

const UNIT_ICONS: Record<string, React.ReactNode> = {
  Shapes: <Shapes size={20} />,
  Dna: <Dna size={20} />,
  Zap: <Zap size={20} />,
  Activity: <Activity size={20} />,
};

// Lazy load mini 3D canvas so initial page stays lightweight
const MiniStage = React.lazy(() =>
  import('@/components/stage/StageCanvas').then((m) => ({
    default: m.StageCanvas,
  }))
);

export default function HomePage() {
  const { completedLessonIds, lastLessonId } = useProgressStore();

  const overallProgress = calculateOverallProgress(LESSONS.length, completedLessonIds);
  const continueLesson = LESSONS.find((l) => l.id === lastLessonId) || LESSONS[0];

  return (
    <div className="min-h-full pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Pitch & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Free Interactive 3D Biology Course</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.1]">
                Touch the molecules. <br />
                <span className="text-amber-600 dark:text-amber-500">Run the biology.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl font-serif leading-relaxed">
                Bioverse is an interactive 3D laboratory modeled on hands-on hardware simulators.
                Rotate neurons, deconstruct the double helix, and trigger live all-or-none action potentials right in your browser.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to={`/lesson/${continueLesson.id}`}>
                  <Button size="lg" className="shadow-md">
                    <span>
                      {completedLessonIds.length > 0
                        ? `Continue: Lesson ${continueLesson.order}`
                        : 'Start Course'}
                    </span>
                    <ArrowRight size={18} />
                  </Button>
                </Link>

                <Link to="/lessons">
                  <Button variant="outline" size="lg">
                    <BookOpen size={18} />
                    <span>Browse All 16 Lessons</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Spec Highlights */}
              <div className="pt-4 flex flex-wrap gap-4 text-xs font-mono text-stone-500 border-t border-stone-200 dark:border-stone-800/60">
                <span className="flex items-center gap-1.5">
                  <Cpu size={14} className="text-amber-600" />
                  100% Procedural 3D (No heavy .glb downloads)
                </span>
                <span>•</span>
                <span>16 Interactive Lessons</span>
                <span>•</span>
                <span>Live Biophysical Simulations</span>
              </div>
            </div>

            {/* Right Column: Live Interactive 3D Stage Preview */}
            <div className="lg:col-span-5 h-80 sm:h-96 lg:h-[420px] rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-lg relative bg-white/50 dark:bg-stone-900/50">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-stone-400">
                    Loading 3D double helix preview...
                  </div>
                }
              >
                <MiniStage
                  modelId="dna"
                  hotspots={[
                    {
                      id: 'hs-helix-demo',
                      label: 'DNA Double Helix',
                      position: [0, 0, 0],
                      description: 'Rotatable 3D double-stranded model with Watson-Crick base pairs.',
                    },
                  ]}
                />
              </Suspense>
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 text-white text-[11px] font-mono">
                  Live 3D Viewport · Drag to Orbit
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Units Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Course Curriculum
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Four structured units spanning cellular machinery to organismal genetics.
            </p>
          </div>

          <div className="flex items-center gap-3 p-2 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/60 self-start sm:self-auto">
            <ProgressRing progress={overallProgress} size={32} strokeWidth={3} color="#ea580c" />
            <div className="text-xs">
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                {completedLessonIds.length} of {LESSONS.length} Completed
              </div>
              <div className="text-stone-500 text-[11px] font-mono">
                {Math.round(overallProgress * 100)}% Course Complete
              </div>
            </div>
          </div>
        </div>

        {/* 4 Unit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UNITS.map((unit) => {
            const unitProgress = calculateUnitProgress(unit, completedLessonIds);
            const unitLessons = LESSONS.filter((l) => l.unit === unit.id);
            const firstLesson = unitLessons[0];

            return (
              <div
                key={unit.id}
                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: `${unit.color}15`, color: unit.color }}
                    >
                      {UNIT_ICONS[unit.iconName] || <Shapes size={22} />}
                    </div>

                    <Chip
                      label={`${unitLessons.length} Lessons`}
                      variant="default"
                      size="sm"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {unit.title}
                  </h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    {unit.subtitle}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-serif mb-4">
                    {unit.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-mono text-stone-500 mb-1.5">
                      <span>Progress</span>
                      <span>{Math.round(unitProgress * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${unitProgress * 100}%`,
                          backgroundColor: unit.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Unit Action Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-xs text-stone-500">
                      {unitProgress === 1 ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        `Starts with: ${firstLesson?.title}`
                      )}
                    </span>

                    <Link to={`/lesson/${firstLesson?.id}`}>
                      <Button variant="secondary" size="sm">
                        <span>Enter Unit</span>
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
