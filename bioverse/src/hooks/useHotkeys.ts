/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

type HotkeyHandler = (e: KeyboardEvent) => void;

interface HotkeyOptions {
  preventDefault?: boolean;
  metaOrCtrl?: boolean;
}

export function useHotkeys(
  keyCombo: string,
  handler: HotkeyHandler,
  options: HotkeyOptions = {}
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in text inputs unless it's an Escape or Ctrl+K
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      const parts = keyCombo.toLowerCase().split('+');
      const targetKey = parts[parts.length - 1];
      const needsMetaCtrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('meta') || options.metaOrCtrl;
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');

      const matchesKey = e.key.toLowerCase() === targetKey;
      const matchesMetaCtrl = needsMetaCtrl ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
      const matchesShift = needsShift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = needsAlt ? e.altKey : !e.altKey;

      if (matchesKey && matchesMetaCtrl && matchesShift && matchesAlt) {
        if (isInput && targetKey !== 'escape' && !needsMetaCtrl) {
          return;
        }
        if (options.preventDefault !== false) {
          e.preventDefault();
        }
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, handler, options]);
}
