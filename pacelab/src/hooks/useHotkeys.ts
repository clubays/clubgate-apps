import { useEffect } from 'react';

export interface HotkeyMap {
  [key: string]: (e: KeyboardEvent) => void;
}

export function useHotkeys(keyMap: HotkeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger hotkeys when user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key;
      const lowerKey = key.toLowerCase();

      if (keyMap[key]) {
        e.preventDefault();
        keyMap[key](e);
      } else if (keyMap[lowerKey]) {
        e.preventDefault();
        keyMap[lowerKey](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap, enabled]);
}
