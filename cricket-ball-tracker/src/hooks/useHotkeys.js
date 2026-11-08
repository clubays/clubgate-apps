import { useEffect } from 'react';

export function useHotkeys(handlers = {}) {
  useEffect(() => {
    function onKeyDown(e) {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onSpace?.();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          handlers.onStepBack10?.();
        } else {
          handlers.onStepBack1?.();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          handlers.onStepForward10?.();
        } else {
          handlers.onStepForward1?.();
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handlers.onToggleManualFix?.();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        handlers.onDeleteDetection?.();
      } else if (e.code === 'KeyA') {
        handlers.onStartAnalyse?.();
      } else if (e.code === 'Escape') {
        handlers.onEscape?.();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
