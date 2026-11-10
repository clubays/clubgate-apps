import { useEffect, useRef } from 'react';

export function useWakeLock(enabled = true) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let isSubscribed = true;

    const requestWakeLock = async () => {
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (isSubscribed) {
          sentinelRef.current = sentinel;
          sentinel.addEventListener('release', () => {
            sentinelRef.current = null;
          });
        } else {
          sentinel.release().catch(() => {});
        }
      } catch {
        // WakeLock request error suppressed
      }
    };

    requestWakeLock();

    // Re-acquire on visibilitychange if page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && !sentinelRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [enabled]);
}
