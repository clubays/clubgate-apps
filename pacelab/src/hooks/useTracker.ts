import { useCallback, useEffect, useRef } from 'react';
import { BALL_PRESETS } from '@/constants';
import { saveDelivery } from '@/db/deliveries';
import { useCalibrationStore } from '@/store/calibrationStore';
import { useLiveStore } from '@/store/liveStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Delivery, DeliveryState, TrackPoint, WorkerResultMessage } from '@/types';
import { playArmBeep, playCaptureBeep, triggerHaptic } from '@/utils/audio';
import { generateId } from '@/utils/id';
import { speakSpeed } from '@/utils/speech';
import { formatSpeed } from '@/utils/units';
import { FrameMetadata, useFrameLoop } from './useFrameLoop';

export function useTracker(videoElement: HTMLVideoElement | null) {
  const { activeCalibration } = useCalibrationStore();
  const settings = useSettingsStore();
  const live = useLiveStore();

  const workerRef = useRef<Worker | null>(null);
  const snapshotCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/tracker.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = async (e: MessageEvent<WorkerResultMessage>) => {
      const data = e.data;

      // Update HUD telemetry
      live.setTelemetry(0, data.processingMs); // FPS updated by useFrameLoop
      live.setState(data.state);

      if (data.detectedCandidate) {
        live.setActiveCandidate(data.detectedCandidate);
      } else {
        live.setActiveCandidate(undefined);
      }

      if (data.trackState) {
        live.setActiveTrack({
          points: data.trackState.points,
          isConfirmed: data.trackState.confirmed,
        });
      }

      // Handle delivery capture
      if (data.deliveryEvent && data.deliveryEvent.type === 'CAPTURED') {
        const event = data.deliveryEvent;

        // Feedback
        if (!live.isMuted) {
          if (settings.beep) playCaptureBeep();
          if (settings.vibration) triggerHaptic(120);
          if (settings.speech) {
            const formatted = formatSpeed(event.speedMps, settings.units, 1);
            speakSpeed(formatted, settings.units);
          }
        }

        // Generate 320px JPEG snapshot with trail overlay
        let snapshotDataUrl = '';
        if (videoElement && videoElement.videoWidth > 0) {
          if (!snapshotCanvasRef.current) {
            snapshotCanvasRef.current = document.createElement('canvas');
          }
          const canvas = snapshotCanvasRef.current;
          const snapW = 320;
          const snapH = Math.round((videoElement.videoHeight * snapW) / videoElement.videoWidth);
          canvas.width = snapW;
          canvas.height = snapH;
          const sCtx = canvas.getContext('2d');
          if (sCtx) {
            // Draw video frame
            sCtx.drawImage(videoElement, 0, 0, snapW, snapH);

            // Draw delivery trail on snapshot
            const scaleX = snapW / videoElement.videoWidth;
            const scaleY = snapH / videoElement.videoHeight;

            if (event.track.length > 1) {
              sCtx.beginPath();
              sCtx.strokeStyle = '#a3e635';
              sCtx.lineWidth = 2.5;
              sCtx.lineCap = 'round';
              sCtx.lineJoin = 'round';

              for (let i = 0; i < event.track.length; i++) {
                const pt = event.track[i];
                const px = pt.x * scaleX;
                const py = pt.y * scaleY;
                if (i === 0) sCtx.moveTo(px, py);
                else sCtx.lineTo(px, py);
              }
              sCtx.stroke();
            }

            snapshotDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
        }

        const deliveryId = generateId('del');
        const sessionId = live.currentSession?.id || 'live_session';

        const deliveryRecord: Delivery = {
          id: deliveryId,
          sessionId,
          createdAt: Date.now(),
          speedMps: event.speedMps,
          gateSpeedMps: event.gateSpeedMps,
          fitSpeedMps: event.fitSpeedMps,
          uncertaintyMps: event.uncertaintyMps,
          method: event.method,
          preBounce: event.preBounce,
          r2: event.r2,
          confidence: event.confidence,
          track: event.track,
          snapshot: snapshotDataUrl,
          bowler: live.currentSession?.bowler,
        };

        // Persist to IndexedDB
        await saveDelivery(deliveryRecord);
        live.addDelivery(deliveryRecord);
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [live, settings, videoElement]);

  // Push frame to worker
  const handleFrame = useCallback(
    (bitmap: ImageBitmap, meta: FrameMetadata) => {
      if (!workerRef.current || !activeCalibration) {
        bitmap.close();
        return;
      }

      // Resolve ball color HSV
      let ballColor = settings.customHsv;
      const preset = BALL_PRESETS.find((p) => p.id === settings.ballPreset);
      if (preset && preset.id !== 'custom') {
        ballColor = {
          hMin: preset.hMin,
          hMax: preset.hMax,
          sMin: preset.sMin,
          sMax: preset.sMax,
          vMin: preset.vMin,
          vMax: preset.vMax,
        };
      }

      workerRef.current.postMessage(
        {
          type: 'PROCESS_FRAME',
          bitmap,
          timestamp: meta.timestamp,
          workW: settings.workWidth,
          settings: {
            sensitivity: settings.sensitivity,
            ballColor,
            pixelsPerMetre: activeCalibration.pixelsPerMetre,
            gateA: activeCalibration.gateA,
            gateB: activeCalibration.gateB,
            distanceM: activeCalibration.distanceM,
            minSpeedKmh: settings.minSpeedKmh,
            isArmed: live.isArmed,
          },
        },
        [bitmap] // transfer ownership for zero-copy performance
      );
    },
    [activeCalibration, live.isArmed, settings]
  );

  const { measuredFps } = useFrameLoop({
    videoElement,
    isActive: true,
    onFrame: handleFrame,
    workWidth: settings.workWidth,
  });

  // Keep liveStore FPS updated
  useEffect(() => {
    live.setTelemetry(measuredFps, live.procMs);
  }, [measuredFps]);

  const resetTracker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' });
    }
    live.resetSession();
  }, [live]);

  return {
    measuredFps,
    resetTracker,
  };
}
