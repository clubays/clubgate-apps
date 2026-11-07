/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GLOSSARY } from '@/data/glossary';
import { LESSONS } from '@/data/lessons';
import { Search, ExternalLink, Volume2, BookOpen } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/utils/cn';

export default function GlossaryPage() {
  const [searchParams] = useSearchParams();
  const initialTerm = searchParams.get('term') || '';

  const [query, setQuery] = useState(initialTerm);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'cell', label: 'The Cell' },
    { id: 'genetics', label: 'DNA & Genetics' },
    { id: 'neuroscience', label: 'Neuroscience' },
    { id: 'physiology', label: 'Physiology' },
  ];

  const filteredEntries = useMemo(() => {
    return GLOSSARY.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.id.includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Page Header */}
      <div className="pb-6 mb-8 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Biological Glossary & Lexicon
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Precise anatomical and biochemical definitions with pronunciations, origins, and course references.
        </p>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search by term or concept..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/60">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary Items List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-sm text-stone-500 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            No terms found matching &quot;{query}&quot;. Try clearing filters.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const relatedLessons = LESSONS.filter((l) =>
              entry.relatedLessons.includes(l.id)
            );

            return (
              <div
                key={entry.id}
                id={entry.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs hover:border-amber-300 dark:hover:border-stone-700 transition-colors"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                      {entry.term}
                    </h2>
                    {entry.pronunciation && (
                      <span className="text-xs font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                        /{entry.pronunciation}/
                      </span>
                    )}
                  </div>
                  <Chip label={entry.category} variant="accent" size="sm" />
                </div>

                <p className="text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed mb-3">
                  {entry.definition}
                </p>

                {entry.etymology && (
                  <div className="text-xs text-stone-500 dark:text-stone-400 italic mb-3">
                    Etymology: {entry.etymology}
                  </div>
                )}

                {/* Related lessons */}
                {relatedLessons.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                    <span className="text-xs font-semibold text-stone-400">
                      Appears in:
                    </span>
                    {relatedLessons.map((l) => (
                      <Link
                        key={l.id}
                        to={`/lesson/${l.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 transition-colors"
                      >
                        <BookOpen size={12} />
                        <span>Lesson {l.order}: {l.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
