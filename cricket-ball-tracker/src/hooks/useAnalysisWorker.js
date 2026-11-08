import { useCallback, useEffect, useRef, useState } from 'react';

export function useAnalysisWorker() {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [workerFps, setWorkerFps] = useState(0);
  const [isLowFpsAlert, setIsLowFpsAlert] = useState(false);

  // Callbacks for events
  const onFrameResultRef = useRef(null);
  const onCompleteRef = useRef(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/analyse.worker.js', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'ready') {
        setIsReady(true);
      } else if (data.type === 'frameResult') {
        if (data.processingFps) {
          setWorkerFps(data.processingFps);
          if (data.processingFps < 12) {
            setIsLowFpsAlert(true);
          }
        }
        if (onFrameResultRef.current) {
          onFrameResultRef.current(data);
        }
      } else if (data.type === 'complete') {
        if (onCompleteRef.current) {
          onCompleteRef.current(data);
        }
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const initWorker = useCallback((config) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'init',
        ...config,
      });
    }
  }, []);

  const sendFrame = useCallback((bitmap, t, frameIdx) => {
    if (workerRef.current) {
      // Transfer bitmap ownership to worker
      workerRef.current.postMessage(
        {
          type: 'frame',
          bitmap,
          t,
          frameIdx,
        },
        [bitmap]
      );
    }
  }, []);

  const finishAnalysis = useCallback((fps) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'finish',
        fps,
      });
    }
  }, []);

  const resetWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'reset' });
    }
  }, []);

  return {
    isReady,
    workerFps,
    isLowFpsAlert,
    initWorker,
    sendFrame,
    finishAnalysis,
    resetWorker,
    onFrameResultRef,
    onCompleteRef,
  };
}
