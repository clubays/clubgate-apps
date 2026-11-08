import create from 'zustand';
import { calibratePitch } from '../functions/calibration.js';
import { detectBounceAndLength, detectRelease, detectSwingAndDeviation } from '../functions/events.js';
import { applyH } from '../functions/homography.js';
import { computeDeliverySpeeds, computeQualityGrade } from '../functions/speed.js';
import { nanoid } from '../utils/id.js';

export const useAnalysisStore = create((set, get) => ({
  // Active step: 1 = Video, 2 = Calibrate, 3 = Analyse, 4 = Review
  step: 1,

  // Video metadata
  videoFile: null,
  videoUrl: null,
  videoWidth: 1280,
  videoHeight: 720,
  duration: 0,
  fps: 60,
  detectedFps: 60,
  isSlowMotion: false,
  recordedAtFps: 60,
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1.0,

  // Calibration
  calibrationMode: 'sideOn', // 'sideOn' | 'behindArm'
  landmarkPoints: [], // Array of [px, py]
  calibration: null, // Solved calibration object
  calibErrorText: null,

  // Ignore zones
  ignoreZones: [], // [{ id, x, y, width, height }]

  // Analysis status
  isAnalyzing: false,
  analysisProgress: 0,
  processingFps: 0,
  analyzedFramesCount: 0,

  // Results
  deliveries: [],
  selectedDeliveryIdx: 0,
  rawDetectionsByFrame: new Map(), // frameIdx -> candidate[]

  // Manual fix mode
  isManualFixMode: false,

  // Actions
  setStep: (step) => set({ step }),

  setVideoSource: ({ file, url, width, height, duration, fps }) => {
    set({
      videoFile: file || null,
      videoUrl: url,
      videoWidth: width || 1280,
      videoHeight: height || 720,
      duration: duration || 0,
      fps: fps || 60,
      detectedFps: fps || 60,
      recordedAtFps: fps || 60,
      step: 2,
    });
  },

  setFpsOverride: (fps) => {
    set({ fps, recordedAtFps: fps });
  },

  setIsSlowMotion: (isSlowMotion, recordedAtFps = 120) => {
    set({
      isSlowMotion,
      recordedAtFps: isSlowMotion ? recordedAtFps : get().fps,
      fps: isSlowMotion ? recordedAtFps : get().detectedFps,
    });
  },

  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  setCalibrationMode: (mode) => {
    set({ calibrationMode: mode, landmarkPoints: [], calibration: null, calibErrorText: null });
  },

  addLandmarkPoint: (point) => {
    const current = [...get().landmarkPoints];
    if (current.length < 4) {
      current.push(point);
      set({ landmarkPoints: current });

      // Automatically solve when 4th point is placed
      if (current.length === 4) {
        get().solveCurrentCalibration();
      }
    }
  },

  updateLandmarkPoint: (index, newPoint) => {
    const current = [...get().landmarkPoints];
    if (current[index]) {
      current[index] = newPoint;
      set({ landmarkPoints: current });
      if (current.length === 4) {
        get().solveCurrentCalibration();
      }
    }
  },

  clearLandmarks: () => set({ landmarkPoints: [], calibration: null, calibErrorText: null }),

  solveCurrentCalibration: () => {
    const { calibrationMode, landmarkPoints, videoWidth, videoHeight } = get();
    if (landmarkPoints.length < 4) return;

    try {
      const calib = calibratePitch(calibrationMode, landmarkPoints, videoWidth, videoHeight);
      set({ calibration: calib, calibErrorText: null });
    } catch (err) {
      set({ calibErrorText: err.message, calibration: null });
    }
  },

  addIgnoreZone: (zone) => {
    set({ ignoreZones: [...get().ignoreZones, { ...zone, id: nanoid() }] });
  },

  removeIgnoreZone: (id) => {
    set({ ignoreZones: get().ignoreZones.filter((z) => z.id !== id) });
  },

  startAnalysis: () => {
    set({
      isAnalyzing: true,
      analysisProgress: 0,
      analyzedFramesCount: 0,
      deliveries: [],
      selectedDeliveryIdx: 0,
    });
  },

  updateAnalysisProgress: (progress, fpsProcessed, frameCount) => {
    set({
      analysisProgress: progress,
      processingFps: fpsProcessed,
      analyzedFramesCount: frameCount,
    });
  },

  finishAnalysis: (deliveries) => {
    set({
      deliveries,
      selectedDeliveryIdx: 0,
      isAnalyzing: false,
      step: 4,
    });
  },

  cancelAnalysis: () => {
    set({ isAnalyzing: false });
  },

  selectDelivery: (idx) => {
    set({ selectedDeliveryIdx: idx });
  },

  toggleManualFixMode: () => {
    set({ isManualFixMode: !get().isManualFixMode });
  },

  /**
   * Add or update manual detection for currently selected delivery at timestamp t
   */
  setManualDetectionAtTime: (t, px, py) => {
    const { deliveries, selectedDeliveryIdx, calibration } = get();
    if (!deliveries[selectedDeliveryIdx] || !calibration) return;

    const delivery = { ...deliveries[selectedDeliveryIdx] };
    const points = [...delivery.points];

    // Check if point close to t already exists (within 0.03s)
    let pointIdx = points.findIndex((p) => Math.abs(p.t - t) < 0.035);

    // Map to metric
    const [X, ZorY] = applyH(calibration.H, px, py);
    const metricPt = {
      t,
      x: px,
      y: py,
      r: 8,
      score: 1.0,
      X,
      Z: calibration.mode === 'sideOn' ? ZorY : 0.1,
      Y: calibration.mode === 'behindArm' ? ZorY : 0,
      isManual: true,
      interpolated: false,
    };

    if (pointIdx >= 0) {
      points[pointIdx] = metricPt;
    } else {
      points.push(metricPt);
      points.sort((a, b) => a.t - b.t);
    }

    delivery.points = points;

    // Instantly re-run speed and event calculations
    get().recalculateDeliveryMetrics(delivery);
  },

  /**
   * Delete detection at timestamp t
   */
  deleteDetectionAtTime: (t) => {
    const { deliveries, selectedDeliveryIdx } = get();
    if (!deliveries[selectedDeliveryIdx]) return;

    const delivery = { ...deliveries[selectedDeliveryIdx] };
    delivery.points = delivery.points.filter((p) => Math.abs(p.t - t) >= 0.035);

    get().recalculateDeliveryMetrics(delivery);
  },

  /**
   * Update markers (Release / Bounce) from timeline drag
   */
  updateDeliveryMarkers: (tRelease, tBounce) => {
    const { deliveries, selectedDeliveryIdx } = get();
    if (!deliveries[selectedDeliveryIdx]) return;

    const delivery = { ...deliveries[selectedDeliveryIdx] };
    if (tRelease !== undefined) delivery.tRelease = tRelease;
    if (tBounce !== undefined) delivery.tBounce = tBounce;

    get().recalculateDeliveryMetrics(delivery);
  },

  /**
   * Recompute metrics for a modified delivery
   */
  recalculateDeliveryMetrics: (updatedDelivery) => {
    const { deliveries, selectedDeliveryIdx, calibration, fps } = get();
    const points = updatedDelivery.points;
    if (points.length < 3) return;

    const tRelease = updatedDelivery.tRelease || detectRelease(points);
    const bounceInfo = detectBounceAndLength(points, tRelease, calibration?.mode || 'sideOn');
    const tBounce = updatedDelivery.tBounce || bounceInfo.tBounce || Infinity;

    const speedMetrics = computeDeliverySpeeds(points, tRelease, tBounce);
    const swingInfo = calibration?.mode === 'behindArm'
      ? detectSwingAndDeviation(points, tRelease, tBounce)
      : { swing: 0, turn: 0 };

    updatedDelivery.tRelease = tRelease;
    updatedDelivery.tBounce = bounceInfo.tBounce;
    updatedDelivery.metrics = {
      ...speedMetrics,
      ...bounceInfo,
      ...swingInfo,
    };

    updatedDelivery.grade = computeQualityGrade({
      fps,
      pointCount: points.length,
      rms: speedMetrics.rms || 0.05,
      hasDroppedFrames: false,
      mode: calibration?.mode || 'sideOn',
      calibRmsCm: calibration?.rmsCm || 0,
    });

    const newDeliveries = [...deliveries];
    newDeliveries[selectedDeliveryIdx] = updatedDelivery;
    set({ deliveries: newDeliveries });
  },

  resetAll: () => {
    set({
      step: 1,
      videoFile: null,
      videoUrl: null,
      duration: 0,
      landmarkPoints: [],
      calibration: null,
      deliveries: [],
      selectedDeliveryIdx: 0,
      isAnalyzing: false,
    });
  },
}));
