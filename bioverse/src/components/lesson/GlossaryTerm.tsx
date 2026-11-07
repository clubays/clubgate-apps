/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GLOSSARY } from '@/data/glossary';

interface GlossaryTermProps {
  id: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({ id, children }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entry = GLOSSARY.find((g) => g.id === id);

  if (!entry) {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="font-medium text-amber-700 dark:text-amber-400 underline decoration-amber-400/50 hover:decoration-amber-600 underline-offset-2 transition-colors cursor-help"
      >
        {children || entry.term}
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-stone-100 text-xs rounded-xl shadow-xl z-50 pointer-events-none block animate-in fade-in zoom-in-95 duration-150">
          <span className="font-semibold text-amber-400 block mb-0.5">{entry.term}</span>
          {entry.pronunciation && (
            <span className="text-stone-400 font-mono text-[11px] block mb-1">
              /{entry.pronunciation}/
            </span>
          )}
          <span className="text-stone-200 leading-normal block">{entry.definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-900" />
        </span>
      )}
    </span>
  );
}
