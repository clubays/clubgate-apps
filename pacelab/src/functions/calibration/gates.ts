import { CRICKET_BALL_DIAMETER_M } from '@/constants';
import { LineSegment, Point2D } from '@/types';
import { distance } from '@/utils/geometry';

export interface CalibrationQualityHint {
  gateSpacingPx: number;
  pixelsPerMetre: number;
  expectedBallDiameterPx: number;
  isAcceptable: boolean;
  warning?: string;
  advice: string;
}

export function lineMidpoint(line: LineSegment): Point2D {
  return {
    x: (line.p1.x + line.p2.x) / 2,
    y: (line.p1.y + line.p2.y) / 2,
  };
}

/**
 * Computes pixels per metre along the pitch axis from Gate A to Gate B
 */
export function calculatePixelsPerMetre(
  gateA: LineSegment,
  gateB: LineSegment,
  distanceM: number
): number {
  if (distanceM <= 0) {
    throw new Error('Calibration distance must be greater than zero.');
  }

  const midA = lineMidpoint(gateA);
  const midB = lineMidpoint(gateB);
  const pxDist = distance(midA, midB);

  return pxDist / distanceM;
}

/**
 * Assesses calibration geometry quality and warns if camera distance is suboptimal
 */
export function evaluateCalibrationQuality(
  gateA: LineSegment,
  gateB: LineSegment,
  distanceM: number,
  origWidth: number,
  workWidth: number = 480
): CalibrationQualityHint {
  const midA = lineMidpoint(gateA);
  const midB = lineMidpoint(gateB);
  const gateSpacingPx = distance(midA, midB);
  const ppm = gateSpacingPx / Math.max(0.1, distanceM);

  // Ball diameter scaled to working resolution
  const scale = workWidth / Math.max(1, origWidth);
  const ballDiameterOrigPx = CRICKET_BALL_DIAMETER_M * ppm;
  const expectedBallDiameterPx = ballDiameterOrigPx * scale;

  let warning: string | undefined;
  let isAcceptable = true;

  if (gateSpacingPx < 80) {
    warning = 'Gate lines are too close together in the frame. Move camera further or zoom out to widen the timing baseline.';
    isAcceptable = false;
  } else if (expectedBallDiameterPx < 4) {
    warning = `Expected ball size is very small (${expectedBallDiameterPx.toFixed(1)} px). The camera may be too far, which limits detection reliability.`;
  } else if (expectedBallDiameterPx > 60) {
    warning = `Expected ball size is very large (${expectedBallDiameterPx.toFixed(1)} px). The camera is too close; ball may fly out of frame quickly.`;
  }

  const advice = `Gate baseline: ${gateSpacingPx.toFixed(0)} px (${ppm.toFixed(1)} px/m). Ball diameter: ~${expectedBallDiameterPx.toFixed(1)} px in detector.`;

  return {
    gateSpacingPx,
    pixelsPerMetre: ppm,
    expectedBallDiameterPx,
    isAcceptable,
    warning,
    advice,
  };
}
