/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UNITS } from '@/data/units';
import { LESSONS } from '@/data/lessons';
import { useProgressStore } from '@/store/useProgressStore';
import { calculateUnitProgress } from '@/functions/progress';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Dna, Shapes, Zap, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

const UNIT_ICONS: Record<string, React.ReactNode> = {
  Shapes: <Shapes size={15} />,
  Dna: <Dna size={15} />,
  Zap: <Zap size={15} />,
  Activity: <Activity size={15} />,
};

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const location = useLocation();
  const { completedLessonIds } = useProgressStore();
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({
    'unit-1': true,
    'unit-2': true,
    'unit-3': true,
    'unit-4': true,
  });

  const toggleUnit = (unitId: string) => {
    setOpenUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  return (
    <aside
      className={cn(
        'w-72 h-[calc(100vh-3.5rem)] flex flex-col bg-stone-50/70 dark:bg-stone-900/60 border-r border-stone-200 dark:border-stone-800 overflow-y-auto select-none',
        className
      )}
    >
      <div className="p-4 border-b border-stone-200/60 dark:border-stone-800/60 text-xs font-semibold text-stone-500 uppercase tracking-wider">
        Course Curriculum
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {UNITS.map((unit) => {
          const unitProgress = calculateUnitProgress(unit, completedLessonIds);
          const isOpen = openUnits[unit.id] ?? true;
          const unitLessons = LESSONS.filter((l) => l.unit === unit.id);

          return (
            <div
              key={unit.id}
              className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900/90 overflow-hidden shadow-2xs"
            >
              {/* Unit Header Accordion */}
              <button
                type="button"
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${unit.color}18`, color: unit.color }}
                  >
                    {UNIT_ICONS[unit.iconName] || <Shapes size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {unit.title}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {Math.round(unitProgress * 100)}% complete
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-stone-400">
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </button>

              {/* Progress bar line under unit header */}
              <div className="h-0.5 w-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${unitProgress * 100}%`,
                    backgroundColor: unit.color,
                  }}
                />
              </div>

              {/* Lesson Items */}
              {isOpen && (
                <div className="py-1 px-1.5 space-y-0.5 bg-stone-50/50 dark:bg-stone-950/30">
                  {unitLessons.map((lesson) => {
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    const isActive = location.pathname === `/lesson/${lesson.id}`;

                    return (
                      <NavLink
                        key={lesson.id}
                        to={`/lesson/${lesson.id}`}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors group cursor-pointer',
                          isActive
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800/60'
                        )}
                      >
                        <span className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle size={13} className="text-stone-300 dark:text-stone-600 group-hover:text-stone-400" />
                          )}
                        </span>
                        <span className="truncate flex-1">
                          {lesson.order}. {lesson.title}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          {lesson.minutes}m
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
