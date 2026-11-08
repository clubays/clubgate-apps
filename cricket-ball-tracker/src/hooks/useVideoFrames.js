import { useCallback, useRef } from 'react';

const COMMON_FPS = [24, 25, 30, 50, 60, 100, 120, 200, 240];

export function roundToNearestFps(rawFps) {
  if (!rawFps || rawFps <= 0) return 60;
  return COMMON_FPS.reduce((prev, curr) =>
    Math.abs(curr - rawFps) < Math.abs(prev - rawFps) ? curr : prev
  );
}

/**
 * Measure frame rate of an uploaded video by sampling rVFC mediaTime deltas over 2s
 */
export async function probeVideoFps(videoEl) {
  return new Promise((resolve) => {
    if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) {
      resolve(30);
      return;
    }

    const deltas = [];
    let lastMediaTime = null;
    let handle = null;
    let sampleCount = 0;

    const originalMuted = videoEl.muted;
    const originalTime = videoEl.currentTime;
    videoEl.muted = true;
    videoEl.currentTime = 0;

    const onFrame = (now, metadata) => {
      if (lastMediaTime !== null) {
        const dt = metadata.mediaTime - lastMediaTime;
        if (dt > 0.002 && dt < 0.1) {
          deltas.push(dt);
        }
      }
      lastMediaTime = metadata.mediaTime;
      sampleCount++;

      if (sampleCount < 60 && metadata.mediaTime < 2.0 && !videoEl.paused) {
        handle = videoEl.requestVideoFrameCallback(onFrame);
      } else {
        finishProbe();
      }
    };

    function finishProbe() {
      if (handle && videoEl.cancelVideoFrameCallback) {
        videoEl.cancelVideoFrameCallback(handle);
      }
      videoEl.pause();
      videoEl.muted = originalMuted;
      videoEl.currentTime = originalTime;

      if (deltas.length < 5) {
        resolve(30);
        return;
      }

      deltas.sort((a, b) => a - b);
      const medianDt = deltas[Math.floor(deltas.length / 2)];
      const rawFps = 1 / medianDt;
      resolve(roundToNearestFps(rawFps));
    }

    videoEl.play().then(() => {
      handle = videoEl.requestVideoFrameCallback(onFrame);
      // Failsafe timeout after 2.5s
      setTimeout(finishProbe, 2500);
    }).catch(() => {
      resolve(30);
    });
  });
}

/**
 * Hook to run frame-by-frame analysis loop
 */
export function useVideoFrames() {
  const isCancelledRef = useRef(false);

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
  }, []);

  /**
   * Run capture loop: plays video muted at 0.25x or seeks frame by frame,
   * creates ImageBitmap for each presented frame and invokes onFrame(bitmap, mediaTime, frameIdx, isDropped)
   */
  const processVideo = useCallback(async (videoEl, fps, onFrame, onProgress) => {
    isCancelledRef.current = false;
    const hasRvfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    const duration = videoEl.duration || 10;
    const expectedDt = 1 / fps;

    let frameIdx = 0;
    let lastMediaTime = null;
    let hasDroppedFrames = false;

    if (hasRvfc) {
      videoEl.muted = true;
      videoEl.currentTime = 0;
      videoEl.playbackRate = 0.25; // Process at 0.25x speed for accurate frame delivery
      await videoEl.play();

      return new Promise((resolve) => {
        let callbackId = null;

        const handleFrame = async (now, metadata) => {
          if (isCancelledRef.current || videoEl.paused || videoEl.ended || metadata.mediaTime >= duration) {
            videoEl.pause();
            if (callbackId && videoEl.cancelVideoFrameCallback) {
              videoEl.cancelVideoFrameCallback(callbackId);
            }
            resolve({ hasDroppedFrames, totalFrames: frameIdx });
            return;
          }

          const currentMediaTime = metadata.mediaTime;
          let isDropped = false;
          if (lastMediaTime !== null) {
            const dt = currentMediaTime - lastMediaTime;
            if (dt > 1.5 * expectedDt) {
              hasDroppedFrames = true;
              isDropped = true;
            }
          }
          lastMediaTime = currentMediaTime;

          try {
            const bitmap = await createImageBitmap(videoEl);
            await onFrame(bitmap, currentMediaTime, frameIdx, isDropped);
            frameIdx++;

            if (onProgress) {
              onProgress(Math.min(1.0, currentMediaTime / duration), frameIdx);
            }
          } catch (err) {
            console.warn('Frame grab error:', err);
          }

          callbackId = videoEl.requestVideoFrameCallback(handleFrame);
        };

        callbackId = videoEl.requestVideoFrameCallback(handleFrame);
      });
    } else {
      // Seek-by-frame fallback when rVFC is unavailable
      const totalFrames = Math.floor(duration * fps);
      for (let i = 0; i < totalFrames; i++) {
        if (isCancelledRef.current) break;
        const targetTime = i / fps;
        videoEl.currentTime = targetTime;

        await new Promise((r) => {
          const onSeeked = () => {
            videoEl.removeEventListener('seeked', onSeeked);
            r();
          };
          videoEl.addEventListener('seeked', onSeeked);
        });

        const bitmap = await createImageBitmap(videoEl);
        await onFrame(bitmap, targetTime, i, false);
        frameIdx++;

        if (onProgress) {
          onProgress(targetTime / duration, frameIdx);
        }
      }
      return { hasDroppedFrames, totalFrames: frameIdx };
    }
  }, []);

  return { processVideo, cancel };
}
