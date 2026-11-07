/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, FileText, ArrowRight } from 'lucide-react';
import { searchBioverse } from '@/functions/search';
import { LESSONS } from '@/data/lessons';
import { GLOSSARY } from '@/data/glossary';
import { SearchResult } from '@/types';
import { useHotkeys } from '@/hooks/useHotkeys';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = searchBioverse(query, LESSONS, GLOSSARY);
    setResults(res);
    setSelectedIndex(0);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSelectResult = (item: SearchResult) => {
    onClose();
    // Path looks like '#/lesson/cell-intro' -> navigate('/lesson/cell-intro')
    const path = item.link.replace('#', '');
    navigate(path);
  };

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search size={18} className="text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lessons, organelles, base pairs, terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-stone-500">
              Type keywords like <span className="text-amber-600 font-mono">neuron</span>,{' '}
              <span className="text-amber-600 font-mono">mitosis</span>,{' '}
              <span className="text-amber-600 font-mono">punnett</span>, or{' '}
              <span className="text-amber-600 font-mono">atp</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">
              No results found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">
                      {item.type === 'lesson' ? <BookOpen size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          {item.subtitle}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {item.snippet}
                      </p>
                    </div>
                    {isSelected && (
                      <ArrowRight size={14} className="text-amber-600 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
