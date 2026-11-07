/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, BookOpen, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-xs">
        <Compass size={32} />
      </div>

      <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
        Lesson or Page Not Found (404)
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mb-6 font-serif">
        The biological structure or lesson you requested does not exist or has moved. Return to the course roadmap to continue learning.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home size={16} />
            <span>Go Home</span>
          </Button>
        </Link>
        <Link to="/lessons">
          <Button size="sm">
            <BookOpen size={16} />
            <span>Browse Lessons</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
