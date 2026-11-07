/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export function StageLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur-xs z-20">
      <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
      <span className="text-xs font-mono text-stone-600 dark:text-stone-400">
        Compiling 3D Procedural Scene...
      </span>
    </div>
  );
}
