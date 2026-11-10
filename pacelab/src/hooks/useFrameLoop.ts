import { useEffect, useRef, useState } from 'react';

export interface FrameMetadata {
  timestamp: number; // In seconds
  mediaTime?: number;
  expectedDisplayTime?: number;
  width: number;
  height: number;
}

export interface UseFrameLoopOptions {
  videoElement: HTMLVideoElement | null;
  isActive: boolean;
  onFrame: (bitmap: ImageBitmap, meta: FrameMetadata) => void;
  workWidth?: number;
  maxInFlightFrames?: number;
}

export function useFrameLoop({
  videoElement,
  isActive,
  onFrame,
  workWidth = 480,
  maxInFlightFrames = 2,
}: UseFrameLoopOptions) {
  const [measuredFps, setMeasuredFps] = useState(0);
  const inFlightCount = useRef(0);
  const frameTimestamps = useRef<number[]>([]);
  const lastFpsUpdate = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    if (!videoElement || !isActive) {
      isRunning.current = false;
      if (animFrameId.current !== null) {
        if ('cancelVideoFrameCallback' in videoElement! && typeof (videoElement as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback === 'function') {
          (videoElement as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback(animFrameId.current);
        } else {
          cancelAnimationFrame(animFrameId.current);
        }
        animFrameId.current = null;
      }
      return;
    }

    isRunning.current = true;

    // Check support for requestVideoFrameCallback
    const hasVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype &&
      typeof (videoElement as unknown as { requestVideoFrameCallback: unknown }).requestVideoFrameCallback === 'function';

    const handleFrame = async (
      now: DOMHighResTimeStamp,
      vfcMetadata?: {
        mediaTime?: number;
        captureTime?: number;
        expectedDisplayTime?: number;
        width?: number;
        height?: number;
      }
    ) => {
      if (!isRunning.current) return;

      const vw = videoElement.videoWidth;
      const vh = videoElement.videoHeight;

      if (vw > 0 && vh > 0) {
        // Measure real incoming FPS
        const nowSec = performance.now() / 1000;
        frameTimestamps.current.push(nowSec);
        // keep last 1 second of timestamps
        frameTimestamps.current = frameTimestamps.current.filter((t) => nowSec - t <= 1.0);

        if (nowSec - lastFpsUpdate.current >= 0.5) {
          lastFpsUpdate.current = nowSec;
          setMeasuredFps(frameTimestamps.current.length);
        }

        // Drop frames if worker queue is backed up
        if (inFlightCount.current < maxInFlightFrames) {
          // Precise timing in seconds from metadata
          let timestampSec = nowSec;
          if (vfcMetadata) {
            if (vfcMetadata.mediaTime !== undefined && vfcMetadata.mediaTime > 0) {
              timestampSec = vfcMetadata.mediaTime;
            } else if (vfcMetadata.captureTime !== undefined && vfcMetadata.captureTime > 0) {
              timestampSec = vfcMetadata.captureTime / 1000;
            } else if (vfcMetadata.expectedDisplayTime !== undefined && vfcMetadata.expectedDisplayTime > 0) {
              timestampSec = vfcMetadata.expectedDisplayTime / 1000;
            }
          }

          inFlightCount.current++;
          try {
            // Transferable downscaled ImageBitmap
            const bitmap = await createImageBitmap(videoElement, 0, 0, vw, vh, {
              resizeWidth: workWidth,
              resizeQuality: 'low',
            });

            onFrame(bitmap, {
              timestamp: timestampSec,
              mediaTime: vfcMetadata?.mediaTime,
              expectedDisplayTime: vfcMetadata?.expectedDisplayTime,
              width: vw,
              height: vh,
            });
          } catch {
            // Frame creation error ignored
          } finally {
            inFlightCount.current = Math.max(0, inFlightCount.current - 1);
          }
        }
      }

      // Schedule next frame
      if (isRunning.current) {
        if (hasVFC) {
          animFrameId.current = (videoElement as unknown as {
            requestVideoFrameCallback: (cb: (now: number, meta: unknown) => void) => number;
          }).requestVideoFrameCallback((time, meta) => handleFrame(time, meta as unknown as { mediaTime?: number; captureTime?: number; expectedDisplayTime?: number }));
        } else {
          animFrameId.current = requestAnimationFrame((time) => handleFrame(time));
        }
      }
    };

    // Kick off loop
    if (hasVFC) {
      animFrameId.current = (videoElement as unknown as {
        requestVideoFrameCallback: (cb: (now: number, meta: unknown) => void) => number;
      }).requestVideoFrameCallback((time, meta) => handleFrame(time, meta as unknown as { mediaTime?: number; captureTime?: number; expectedDisplayTime?: number }));
    } else {
      animFrameId.current = requestAnimationFrame((time) => handleFrame(time));
    }

    return () => {
      isRunning.current = false;
      if (animFrameId.current !== null) {
        if (hasVFC && typeof (videoElement as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback === 'function') {
          (videoElement as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback(animFrameId.current);
        } else {
          cancelAnimationFrame(animFrameId.current);
        }
        animFrameId.current = null;
      }
    };
  }, [videoElement, isActive, onFrame, workWidth, maxInFlightFrames]);

  return {
    measuredFps,
  };
}
