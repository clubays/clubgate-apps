import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef(null);

  const requestLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsLocked(true);

        lock.addEventListener('release', () => {
          setIsLocked(false);
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err.message);
      }
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      releaseLock();
    };
  }, [releaseLock]);

  return { isLocked, requestLock, releaseLock };
}
