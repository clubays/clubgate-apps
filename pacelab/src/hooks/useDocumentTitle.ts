import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';

interface RouteHandle {
  title?: string;
  crumb?: string;
}

export function useDocumentTitle(defaultTitle = 'PaceLab') {
  let matches: ReturnType<typeof useMatches> = [];
  try {
    // useMatches throws if not within a data router
    matches = useMatches();
  } catch {
    matches = [];
  }

  useEffect(() => {
    if (matches.length > 0) {
      const currentMatch = [...matches].reverse().find(
        (m) => m.handle && typeof m.handle === 'object' && 'title' in (m.handle as RouteHandle)
      );

      if (currentMatch) {
        const handle = currentMatch.handle as RouteHandle;
        document.title = handle.title ? `${handle.title} | PaceLab` : 'PaceLab - Cricket Ball Speed Tracker';
        return;
      }
    }
    document.title = defaultTitle;
  }, [matches, defaultTitle]);
}
