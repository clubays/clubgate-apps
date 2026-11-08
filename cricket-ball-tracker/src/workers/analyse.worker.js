import { ClassicalBallDetector } from '../functions/detect.js';
import { segmentDeliveries } from '../functions/segment.js';
import { BallTracker } from '../functions/track.js';

let detector = null;
let tracker = null;
let offscreenCanvas = null;
let offscreenCtx = null;

let workingWidth = 640;
let workingHeight = 360;
let fullWidth = 1280;
let fullHeight = 720;
let coordScale = 1.0;

let calibration = null;
let ballPreset = 'red';
let ignoreZones = [];
let allTracks = []; // Finished tracks
let processedFrames = 0;
let lastFpsTime = 0;
let currentFps = 0;

self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg) return;

  switch (msg.type) {
    case 'init': {
      fullWidth = msg.width || 1280;
      fullHeight = msg.height || 720;
      calibration = msg.calibration || null;
      ballPreset = msg.ballPreset || 'red';
      ignoreZones = msg.ignoreZones || [];

      // Determine working size: long side max 640 px (or 480 for mobile/live)
      const targetLongSide = msg.workingSize || 640;
      if (fullWidth >= fullHeight) {
        workingWidth = Math.min(targetLongSide, fullWidth);
        workingHeight = Math.round((workingWidth * fullHeight) / fullWidth);
      } else {
        workingHeight = Math.min(targetLongSide, fullHeight);
        workingWidth = Math.round((workingHeight * fullWidth) / fullHeight);
      }
      coordScale = fullWidth / workingWidth;

      if (!offscreenCanvas || offscreenCanvas.width !== workingWidth || offscreenCanvas.height !== workingHeight) {
        if (typeof OffscreenCanvas !== 'undefined') {
          offscreenCanvas = new OffscreenCanvas(workingWidth, workingHeight);
          offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
        }
      }

      detector = new ClassicalBallDetector();
      detector.init(workingWidth, workingHeight);

      tracker = new BallTracker({ calibration });
      allTracks = [];
      processedFrames = 0;
      lastFpsTime = performance.now();

      self.postMessage({
        type: 'ready',
        workingWidth,
        workingHeight,
        coordScale,
      });
      break;
    }

    case 'updateSettings': {
      if (msg.calibration !== undefined) {
        calibration = msg.calibration;
        if (tracker) tracker.setCalibration(calibration);
      }
      if (msg.ballPreset !== undefined) ballPreset = msg.ballPreset;
      if (msg.ignoreZones !== undefined) ignoreZones = msg.ignoreZones;
      break;
    }

    case 'frame': {
      const { bitmap, t, frameIdx } = msg;
      if (!bitmap) return;

      const frameStartTime = performance.now();

      try {
        if (offscreenCtx) {
          offscreenCtx.drawImage(bitmap, 0, 0, workingWidth, workingHeight);
          const imageData = offscreenCtx.getImageData(0, 0, workingWidth, workingHeight);

          // Detect candidates
          const candidates = detector.detect(imageData, {
            t,
            calibration,
            ballPreset,
            ignoreZones,
            coordScale,
          });

          // Feed into tracker
          const trackPoint = tracker.processFrame(candidates, t);

          // If current track just finished, save it and create new tracker
          if (tracker.state === 'finished') {
            const finished = tracker.finalize();
            if (finished.rawPoints.length >= 6) {
              allTracks.push(finished.rawPoints);
            }
            tracker = new BallTracker({ calibration });
          }

          processedFrames++;
          const now = performance.now();
          if (now - lastFpsTime >= 500) {
            currentFps = (processedFrames / (now - lastFpsTime)) * 1000;
            processedFrames = 0;
            lastFpsTime = now;
          }

          self.postMessage({
            type: 'frameResult',
            frameIdx,
            t,
            candidates,
            trackPoint,
            currentTrackState: tracker.state,
            processingFps: Math.round(currentFps),
          });
        }
      } catch (err) {
        self.postMessage({ type: 'error', error: err.message, frameIdx });
      } finally {
        // Free transferable bitmap memory
        if (bitmap.close) {
          bitmap.close();
        }
      }
      break;
    }

    case 'finish': {
      const fps = msg.fps || 60;
      // Finalize any currently active track
      if (tracker && tracker.rawTrack.length >= 6) {
        const finished = tracker.finalize();
        allTracks.push(finished.rawPoints);
      }

      // Segment deliveries
      const deliveries = segmentDeliveries(allTracks, calibration, fps);

      self.postMessage({
        type: 'complete',
        deliveries,
        trackCount: allTracks.length,
      });
      break;
    }

    case 'reset': {
      if (detector) detector.reset();
      if (tracker) tracker.reset();
      allTracks = [];
      processedFrames = 0;
      self.postMessage({ type: 'resetComplete' });
      break;
    }

    default:
      break;
  }
};
