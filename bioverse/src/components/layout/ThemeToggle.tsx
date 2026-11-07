/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
      title={theme === 'paper' ? 'Switch to Lab (Dark) theme' : 'Switch to Paper (Light) theme'}
      aria-label="Toggle theme"
    >
      {theme === 'paper' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
