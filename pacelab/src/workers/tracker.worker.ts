import { getExpectedBallSize } from '@/functions/calibration/expectedBallSize';
import { DeliveryStateMachine } from '@/functions/delivery/deliveryDetector';
import { TrackManager } from '@/functions/tracking/trackManager';
import { colorMask } from '@/functions/vision/colorMask';
import { combineMasks } from '@/functions/vision/combineMasks';
import { diffFrames } from '@/functions/vision/diffFrames';
import { ConnectedComponentLabeler } from '@/functions/vision/labelComponents';
import { scoreCandidates } from '@/functions/vision/scoreCandidates';
import { WorkerFrameMessage, WorkerResetMessage, WorkerResultMessage } from '@/types';

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

let currentWorkW = 0;
let currentWorkH = 0;

let prevLuma: Uint8Array | null = null;
let currLuma: Uint8Array | null = null;
let diffMask: Uint8Array | null = null;
let colorMaskBuf: Uint8Array | null = null;
let combinedMaskBuf: Uint8Array | null = null;
let labeler: ConnectedComponentLabeler | null = null;

let trackManager: TrackManager | null = null;
let deliveryStateMachine: DeliveryStateMachine | null = null;
let isInitialized = false;

function ensureBuffers(workW: number, workH: number): void {
  if (currentWorkW === workW && currentWorkH === workH && prevLuma !== null) {
    return;
  }
  currentWorkW = workW;
  currentWorkH = workH;
  canvas = new OffscreenCanvas(workW, workH);
  ctx = canvas.getContext('2d', { willReadFrequently: true });

  const pixelCount = workW * workH;
  prevLuma = new Uint8Array(pixelCount);
  currLuma = new Uint8Array(pixelCount);
  diffMask = new Uint8Array(pixelCount);
  colorMaskBuf = new Uint8Array(pixelCount);
  combinedMaskBuf = new Uint8Array(pixelCount);
  labeler = new ConnectedComponentLabeler(workW, workH);
  isInitialized = false;
}

self.onmessage = (e: MessageEvent<WorkerFrameMessage | WorkerResetMessage>) => {
  const data = e.data;

  if (data.type === 'RESET') {
    if (trackManager) trackManager.reset();
    if (deliveryStateMachine) deliveryStateMachine.reset();
    if (prevLuma) prevLuma.fill(0);
    isInitialized = false;
    return;
  }

  if (data.type === 'PROCESS_FRAME') {
    const startTime = performance.now();
    const { bitmap, timestamp, workW, settings } = data;
    const origW = bitmap.width;
    const origH = bitmap.height;
    const workH = Math.round((origH * workW) / origW);

    ensureBuffers(workW, workH);

    if (!trackManager) {
      trackManager = new TrackManager(1, origW, origH, workW, workH);
    } else {
      trackManager.updateScales(origW, origH, workW, workH);
    }

    if (!deliveryStateMachine) {
      deliveryStateMachine = new DeliveryStateMachine(settings.minSpeedKmh, 2.5);
    }
    deliveryStateMachine.setArmed(settings.isArmed);

    // Draw bitmap to offscreen canvas and grab RGBA
    ctx!.drawImage(bitmap, 0, 0, workW, workH);
    bitmap.close(); // free transferred ImageBitmap immediately
    const imageData = ctx!.getImageData(0, 0, workW, workH);
    const rgba = imageData.data;

    let detectedCandidate = undefined;

    if (!isInitialized) {
      // First frame: populate initial luma buffer
      for (let i = 0; i < workW * workH; i++) {
        const r = rgba[i * 4];
        const g = rgba[i * 4 + 1];
        const b = rgba[i * 4 + 2];
        prevLuma![i] = (77 * r + 150 * g + 29 * b) >> 8;
      }
      isInitialized = true;
    } else {
      // 1. Frame differencing
      diffFrames(rgba, prevLuma!, diffMask!, currLuma!, workW, workH, settings.sensitivity);

      // 2. Color masking
      const matchCount = colorMask(rgba, colorMaskBuf!, workW, workH, settings.ballColor);

      // 3. Combine masks
      const { isColorConstrained } = combineMasks(
        diffMask!,
        colorMaskBuf!,
        combinedMaskBuf!,
        workW,
        workH,
        matchCount
      );

      // 4. Label connected components
      const blobs = labeler!.label(combinedMaskBuf!);

      // 5. Predict next position & search ROI
      const pred = trackManager.predict(timestamp);

      // 6. Expected ball size scaled to working resolution
      const ppmWorking = settings.pixelsPerMetre * (workW / origW);
      const expectedBall = getExpectedBallSize(ppmWorking);

      // 7. Score candidates
      const candidate = scoreCandidates(
        blobs,
        expectedBall,
        colorMaskBuf!,
        workW,
        pred || undefined,
        isColorConstrained
      );

      if (candidate) {
        detectedCandidate = {
          x: candidate.blob.cx,
          y: candidate.blob.cy,
          radius: candidate.radius,
          confidence: candidate.confidence,
        };
        trackManager.update(
          { x: candidate.blob.cx, y: candidate.blob.cy, confidence: candidate.confidence },
          timestamp
        );
      } else {
        trackManager.update(null, timestamp);
      }

      // Roll luma buffer
      prevLuma!.set(currLuma!);
    }

    // Step delivery state machine
    const stepResult = deliveryStateMachine.step({
      timestamp,
      isArmed: settings.isArmed,
      isConfirmed: trackManager.isConfirmed,
      isLost: trackManager.isLost,
      trackPoints: trackManager.points,
      gateA: settings.gateA,
      gateB: settings.gateB,
      distanceM: settings.distanceM,
      pixelsPerMetre: settings.pixelsPerMetre,
    });

    // If delivery was captured, reset track for the next ball
    if (stepResult.captureEvent) {
      trackManager.reset();
    }

    const procMs = performance.now() - startTime;

    const resultMessage: WorkerResultMessage = {
      type: 'FRAME_PROCESSED',
      timestamp,
      processingMs: procMs,
      detectedCandidate,
      trackState: trackManager.points.length > 0 ? {
        id: trackManager.id,
        x: trackManager.points[trackManager.points.length - 1].x,
        y: trackManager.points[trackManager.points.length - 1].y,
        vx: trackManager.kalman ? trackManager.kalman.state[2] : 0,
        vy: trackManager.kalman ? trackManager.kalman.state[3] : 0,
        confirmed: trackManager.isConfirmed,
        points: trackManager.points,
      } : undefined,
      deliveryEvent: stepResult.captureEvent ? {
        type: 'CAPTURED',
        speedMps: stepResult.captureEvent.speedMps,
        gateSpeedMps: stepResult.captureEvent.gateSpeedMps,
        fitSpeedMps: stepResult.captureEvent.fitSpeedMps,
        uncertaintyMps: stepResult.captureEvent.uncertaintyMps,
        method: stepResult.captureEvent.method,
        preBounce: stepResult.captureEvent.preBounce,
        r2: stepResult.captureEvent.r2,
        confidence: stepResult.captureEvent.confidence,
        track: stepResult.captureEvent.track,
        crossedGateB: stepResult.captureEvent.crossedGateB,
      } : undefined,
      state: stepResult.state,
    };

    self.postMessage(resultMessage);
  }
};
