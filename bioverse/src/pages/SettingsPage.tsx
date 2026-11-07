/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProgressStore } from '@/store/useProgressStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Sun, Moon, Globe, ZapOff, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, reduceMotion, setReduceMotion } =
    useSettingsStore();
  const { resetAllProgress, completedLessonIds } = useProgressStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleConfirmReset = () => {
    resetAllProgress();
    setIsResetModalOpen(false);
    setToastMessage('Course progress has been completely reset.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Customize laboratory appearance, accessibility, and course data.
        </p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Interface Theme
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Choose between soft paper scientific daytime view or dark lab view.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('paper')}
            className={cn(
              'flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer',
              theme === 'paper'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-2xs ring-1 ring-amber-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
            )}
          >
            <Sun size={18} className="text-amber-600" />
            <span>Paper (Light)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('lab')}
            className={cn(
              'flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer',
              theme === 'lab'
                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-2xs ring-1 ring-amber-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
            )}
          >
            <Moon size={18} className="text-amber-500" />
            <span>Lab (Dark)</span>
          </button>
        </div>
      </div>

      {/* 2. Language & Localization */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Language & Direction
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select language with instant Right-to-Left (RTL) layout support.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={cn(
              'flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer',
              language === 'en'
                ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
            )}
          >
            <Globe size={18} className="text-teal-600" />
            <span>English (LTR)</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('he')}
            className={cn(
              'flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer',
              language === 'he'
                ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-700 dark:text-stone-300'
            )}
          >
            <Globe size={18} className="text-teal-600" />
            <span>עברית (Hebrew RTL)</span>
          </button>
        </div>
      </div>

      {/* 3. Accessibility & Motion */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Accessibility
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Optimize experience for reduced motion and performance preferences.
          </p>
        </div>

        <label className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer">
          <div className="flex items-center gap-3">
            <ZapOff size={18} className="text-stone-500" />
            <div>
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Reduce 3D Transitions & Motion
              </div>
              <div className="text-xs text-stone-500">
                Instantly jump camera views and disable continuous rotational inertia.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* 4. Data Management & Reset */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-rose-200/80 dark:border-rose-950/60 space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Course Data & Progress
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Currently {completedLessonIds.length} lessons recorded as complete in local storage.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
          >
            <Trash2 size={16} />
            Reset All Course Progress
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Reset Course Progress"
      >
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
          Are you sure you want to reset all 16 lesson completions and quiz scores? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmReset}>
            Yes, Reset Everything
          </Button>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
