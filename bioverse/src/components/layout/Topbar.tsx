/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, Dna, BookOpen, Layers, Settings as SettingsIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SearchPalette } from './SearchPalette';
import { ProgressRing } from '@/components/lesson/ProgressRing';
import { useProgressStore } from '@/store/useProgressStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { LESSONS } from '@/data/lessons';
import { calculateOverallProgress } from '@/functions/progress';
import { useHotkeys } from '@/hooks/useHotkeys';
import { cn } from '@/utils/cn';

interface TopbarProps {
  onToggleMobileDrawer?: () => void;
}

export function Topbar({ onToggleMobileDrawer }: TopbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const { completedLessonIds } = useProgressStore();
  const { language, setLanguage } = useSettingsStore();

  const overallProgress = calculateOverallProgress(LESSONS.length, completedLessonIds);

  // Global hotkeys for search: '/' and 'Ctrl+K'
  useHotkeys('/', () => setIsSearchOpen(true));
  useHotkeys('ctrl+k', () => setIsSearchOpen(true));

  const navLinks = [
    { to: '/lessons', label: 'Lessons', icon: <BookOpen size={15} /> },
    { to: '/models', label: 'Models', icon: <Layers size={15} /> },
    { to: '/glossary', label: 'Glossary', icon: <Dna size={15} /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon size={15} /> },
  ];

  return (
    <>
      <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileDrawer && (
            <button
              type="button"
              onClick={onToggleMobileDrawer}
              className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Dna size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-stone-100">
              Bioverse
            </span>
          </Link>
        </div>

        {/* Center: Search Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 w-64 lg:w-80 rounded-xl bg-stone-100 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-500 hover:border-amber-400 dark:hover:border-amber-600 transition-colors cursor-pointer"
        >
          <Search size={14} className="text-stone-400 shrink-0" />
          <span className="flex-1 text-left truncate">Search lessons, models, terms...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-stone-400">
            /
          </kbd>
        </button>

        {/* Right: Nav Links, Progress Ring & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Progress Ring Indicator */}
          <Link
            to="/lessons"
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors"
            title="Course Progress"
          >
            <ProgressRing progress={overallProgress} size={24} strokeWidth={2.5} color="#ea580c" />
            <span className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 hidden sm:inline">
              {Math.round(overallProgress * 100)}%
            </span>
          </Link>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
            className="px-2 py-1 text-xs font-bold rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors uppercase cursor-pointer"
            title="Toggle Language (EN / HE)"
          >
            {language === 'en' ? 'HE' : 'EN'}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Search Palette Modal */}
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
