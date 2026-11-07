/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSimulationOptions {
  initialPlaying?: boolean;
  baseIntervalMs?: number;
  onTick?: () => void;
}

export function useSimulation({
  initialPlaying = false,
  baseIntervalMs = 200,
  onTick,
}: UseSimulationOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(initialPlaying);
  const [speed, setSpeed] = useState<number>(1);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), []);

  const step = useCallback(() => {
    setIsPlaying(false);
    onTickRef.current?.();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = Math.max(30, baseIntervalMs / speed);
    const timer = setInterval(() => {
      onTickRef.current?.();
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, speed, baseIntervalMs]);

  return {
    isPlaying,
    speed,
    play,
    pause,
    toggle,
    setSpeed,
    step,
  };
}
