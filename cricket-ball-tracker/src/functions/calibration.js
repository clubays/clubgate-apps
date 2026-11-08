import { PITCH, LANDMARK_DEFINITIONS } from '../data/landmarks.js';
import { applyH, invert3, reprojectionError, solveHomography } from './homography.js';

/**
 * Validate landmark tap spacing
 * Stumps must be at least 20px tall in the image
 */
export function validateLandmarks(mode, points) {
  if (!points || points.length < 4) {
    return { valid: false, error: 'Please place all 4 landmark points' };
  }

  if (mode === 'sideOn') {
    const bowlerDy = Math.abs(points[1][1] - points[0][1]);
    const strikerDy = Math.abs(points[3][1] - points[2][1]);
    if (bowlerDy < 20 || strikerDy < 20) {
      return {
        valid: false,
        error: 'Zoom in or move the camera closer, the stumps are too small (less than 20 px tall).',
      };
    }
  }

  return { valid: true };
}

/**
 * Build homography from 4 landmark points to metric plane
 * Returns forward H (pixel -> metres) and inverse invH (metres -> pixel)
 */
export function calibratePitch(mode, imagePoints, frameWidth, frameHeight) {
  const validation = validateLandmarks(mode, imagePoints);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const defs = LANDMARK_DEFINITIONS[mode] || LANDMARK_DEFINITIONS.sideOn;
  const metricPoints = defs.map((d) => d.plane);

  // solveHomography maps imagePoints (src) -> metricPoints (dst)
  const H = solveHomography(imagePoints, metricPoints);
  const invH = invert3(H);

  // Compute RMS reprojection error
  const { rms, perPoint } = reprojectionError(H, imagePoints, metricPoints);
  const rmsCm = rms * 100;

  return {
    mode,
    imagePoints,
    metricPoints,
    H,
    invH,
    rmsCm,
    perPointCm: perPoint.map((p) => p * 100),
    frameWidth,
    frameHeight,
    isAccurate: rmsCm <= 5.0,
    timestamp: Date.now(),
  };
}

/**
 * Generate pitch grid marks projected back to pixel space for visual verification
 * Ticks every 1 m along the pitch axis (X = 0 to 20.12)
 */
export function generatePitchGridLines(calibration) {
  if (!calibration || !calibration.invH) return [];

  const { invH, mode } = calibration;
  const ticks = [];

  for (let x = 0; x <= 20.12; x += 1) {
    const xCoord = Math.min(x, 20.12);
    if (mode === 'sideOn') {
      // Bottom of pitch (Z = 0) and top of stump height (Z = 0.711)
      const [pxBase, pyBase] = applyH(invH, xCoord, 0);
      const [pxTop, pyTop] = applyH(invH, xCoord, PITCH.stumpHeight);
      ticks.push({
        x: xCoord,
        isStumpLine: xCoord === 0 || Math.abs(xCoord - 20.12) < 0.05,
        isPoppingCrease: Math.abs(xCoord - 1.22) < 0.05 || Math.abs(xCoord - (20.12 - 1.22)) < 0.05,
        base: [pxBase, pyBase],
        top: [pxTop, pyTop],
      });
    } else {
      // Behind-arm ground rectangle (Y = 0 to Y = 2.64)
      const [pxLeft, pyLeft] = applyH(invH, xCoord, 0);
      const [pxRight, pyRight] = applyH(invH, xCoord, PITCH.creaseWidth);
      ticks.push({
        x: xCoord,
        isStumpLine: xCoord === 0 || Math.abs(xCoord - 20.12) < 0.05,
        isPoppingCrease: Math.abs(xCoord - 1.22) < 0.05 || Math.abs(xCoord - (20.12 - 1.22)) < 0.05,
        base: [pxLeft, pyLeft],
        top: [pxRight, pyRight],
      });
    }
  }

  return ticks;
}

/**
 * Calculate local scale (metres per pixel) at given pixel coordinate
 */
export function getMetresPerPixel(H, px, py) {
  const [m1x, m1y] = applyH(H, px, py);
  const [m2x, m2y] = applyH(H, px + 10, py);
  const [m3x, m3y] = applyH(H, px, py + 10);

  const d1 = Math.sqrt((m2x - m1x) ** 2 + (m2y - m1y) ** 2) / 10;
  const d2 = Math.sqrt((m3x - m1x) ** 2 + (m3y - m1y) ** 2) / 10;
  return (d1 + d2) / 2;
}
