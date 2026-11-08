import { PITCH } from '../data/landmarks.js';
import { detectBounceAndLength, detectRelease, detectSwingAndDeviation } from './events.js';
import { applyH } from './homography.js';
import { computeDeliverySpeeds, computeQualityGrade } from './speed.js';

/**
 * Convert raw pixel points to pitch metric coordinates (X, Z) or (X, Y)
 */
export function mapPointsToMetres(points, calibration) {
  if (!calibration || !calibration.H) return points;

  return points.map((p) => {
    try {
      const [X, ZorY] = applyH(calibration.H, p.x, p.y);
      if (calibration.mode === 'behindArm') {
        return {
          ...p,
          X,
          Y: ZorY,
          Z: 0.1, // Near ground
        };
      } else {
        return {
          ...p,
          X,
          Z: ZorY,
          Y: 0,
        };
      }
    } catch {
      return { ...p, X: null, Z: null, Y: null };
    }
  });
}

/**
 * Process a tracked trajectory into a full delivery structure with metrics & grade
 */
export function buildDeliveryFromTrack(rawTrackPoints, deliveryIdx, calibration, fps = 60, hasDroppedFrames = false) {
  if (!rawTrackPoints || rawTrackPoints.length < 5) return null;

  // Map to meters
  const metricPoints = mapPointsToMetres(rawTrackPoints, calibration);

  // Filter out any points that blew up
  const validPoints = metricPoints.filter((p) => p.X != null && !isNaN(p.X));
  if (validPoints.length < 5) return null;

  const firstPt = validPoints[0];
  const lastPt = validPoints[validPoints.length - 1];
  const duration = lastPt.t - firstPt.t;

  // Ignore tracks shorter than 6 points or 0.20s
  if (validPoints.length < 6 || duration < 0.20) return null;

  // Release detection
  const tRelease = detectRelease(validPoints);

  // Bounce and length
  const bounceInfo = detectBounceAndLength(validPoints, tRelease, calibration?.mode || 'sideOn');
  const tBounce = bounceInfo.tBounce || Infinity;

  // Speeds & uncertainties
  const speedMetrics = computeDeliverySpeeds(validPoints, tRelease, tBounce);

  // Swing & turn in behindArm mode
  const swingInfo = calibration?.mode === 'behindArm'
    ? detectSwingAndDeviation(validPoints, tRelease, tBounce)
    : { swing: 0, turn: 0 };

  // Combine metrics
  const metrics = {
    ...speedMetrics,
    ...bounceInfo,
    ...swingInfo,
  };

  // Quality grading
  const grade = computeQualityGrade({
    fps,
    pointCount: validPoints.length,
    rms: metrics.rms || 0.05,
    hasDroppedFrames,
    mode: calibration?.mode || 'sideOn',
    calibRmsCm: calibration?.rmsCm || 0,
  });

  // Time boundaries with 0.5s padding
  const tStart = Math.max(0, firstPt.t - 0.5);
  const tEnd = lastPt.t + 0.5;

  return {
    id: `ball-${deliveryIdx + 1}-${Date.now().toString(36)}`,
    name: `Ball ${deliveryIdx + 1}`,
    tStart,
    tEnd,
    tRelease,
    tBounce: bounceInfo.tBounce,
    points: validPoints,
    metrics,
    grade,
    notes: '',
  };
}

/**
 * Segment a full timeline of detected tracks into distinct deliveries
 */
export function segmentDeliveries(allTracks, calibration, fps = 60) {
  const deliveries = [];
  let count = 0;

  for (const trackPoints of allTracks) {
    const delivery = buildDeliveryFromTrack(trackPoints, count, calibration, fps);
    if (delivery) {
      deliveries.push(delivery);
      count++;
    }
  }

  return deliveries;
}
