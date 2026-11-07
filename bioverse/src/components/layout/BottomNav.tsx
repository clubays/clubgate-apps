/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Layers, Dna, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

export function BottomNav() {
  const tabs = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/lessons', label: 'Lessons', icon: <BookOpen size={18} /> },
    { to: '/models', label: '3D Models', icon: <Layers size={18} /> },
    { to: '/glossary', label: 'Glossary', icon: <Dna size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 z-40 flex items-center justify-around px-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            )
          }
        >
          {tab.icon}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
