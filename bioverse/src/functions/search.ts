/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, GlossaryEntry, SearchResult } from '@/types';

export function searchBioverse(
  query: string,
  lessons: Lesson[],
  glossary: GlossaryEntry[]
): SearchResult[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const results: SearchResult[] = [];

  // Search lessons
  for (const lesson of lessons) {
    let score = 0;
    const titleMatch = lesson.title.toLowerCase().indexOf(clean);
    const summaryMatch = lesson.summary.toLowerCase().indexOf(clean);

    if (titleMatch !== -1) {
      score += titleMatch === 0 ? 50 : 30;
    }
    if (summaryMatch !== -1) {
      score += 15;
    }

    // Step bodies
    let snippet = lesson.summary;
    for (const step of lesson.steps) {
      const stepIdx = step.body.toLowerCase().indexOf(clean);
      if (stepIdx !== -1) {
        score += 10;
        const start = Math.max(0, stepIdx - 20);
        const end = Math.min(step.body.length, stepIdx + clean.length + 40);
        snippet = `...${step.body.slice(start, end)}...`;
        break;
      }
    }

    if (score > 0) {
      results.push({
        id: `lesson-${lesson.id}`,
        type: 'lesson',
        title: lesson.title,
        subtitle: `Unit ${lesson.unit} · Lesson ${lesson.order}`,
        snippet,
        link: `#/lesson/${lesson.id}`,
        score,
      });
    }
  }

  // Search glossary
  for (const item of glossary) {
    let score = 0;
    const termMatch = item.term.toLowerCase().indexOf(clean);
    const defMatch = item.definition.toLowerCase().indexOf(clean);

    if (termMatch !== -1) {
      score += termMatch === 0 ? 45 : 25;
    }
    if (defMatch !== -1) {
      score += 12;
    }

    if (score > 0) {
      results.push({
        id: `glossary-${item.id}`,
        type: 'glossary',
        title: item.term,
        subtitle: `Glossary · ${item.category}`,
        snippet: item.definition,
        link: `#/glossary?term=${item.id}`,
        score,
      });
    }
  }

  // Sort by highest score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}
