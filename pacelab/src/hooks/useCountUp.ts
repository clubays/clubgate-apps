import { useEffect, useRef, useState } from 'react';

export function useCountUp(targetValue: number, durationMs = 600, decimals = 1): string {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const startValRef = useRef(targetValue);
  const startTimeRef = useRef(0);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || durationMs <= 0 || isNaN(targetValue) || targetValue <= 0) {
      setCurrentValue(targetValue);
      startValRef.current = targetValue;
      return;
    }

    const startVal = startValRef.current;
    startTimeRef.current = performance.now();

    const animate = (now: DOMHighResTimeStamp) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1.0, elapsed / durationMs);

      // Ease-out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (targetValue - startVal) * easeOut;
      setCurrentValue(val);

      if (progress < 1.0) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        startValRef.current = targetValue;
        setCurrentValue(targetValue);
      }
    };

    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animIdRef.current !== null) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [targetValue, durationMs]);

  if (isNaN(currentValue) || currentValue <= 0) {
    return '--.-';
  }
  return currentValue.toFixed(decimals);
}
