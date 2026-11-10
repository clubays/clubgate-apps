import { TrackPoint } from '@/types';

export interface BounceDetectionResult {
  hasBounce: boolean;
  bounceIndex: number;
  bounceTime?: number;
  preBouncePoints: TrackPoint[];
  postBouncePoints: TrackPoint[];
}

/**
 * Detects pitch bounce by finding local extreme in image-y (reversal from downward to upward)
 * In standard canvas coordinates, y points downwards.
 * Pitch rebound occurs when y reaches a local peak and vy changes from positive (downward) to negative (upward).
 */
export function detectBounce(track: TrackPoint[]): BounceDetectionResult {
  if (track.length < 5) {
    return {
      hasBounce: false,
      bounceIndex: -1,
      preBouncePoints: track,
      postBouncePoints: [],
    };
  }

  let bestPeakIdx = -1;
  let maxVyChange = 0;

  // We look between 2 and length - 3 to allow sufficient window before and after
  for (let i = 2; i < track.length - 2; i++) {
    const ptPrev = track[i - 1];
    const ptCurr = track[i];
    const ptNext = track[i + 1];

    const dt1 = ptCurr.t - ptPrev.t;
    const dt2 = ptNext.t - ptCurr.t;

    if (dt1 <= 0 || dt2 <= 0) continue;

    // Velocity in y (px/s)
    const vyBefore = (ptCurr.y - ptPrev.y) / dt1;
    const vyAfter = (ptNext.y - ptCurr.y) / dt2;

    // Downward motion (positive vy) turning upward (negative vy)
    const vyChange = vyBefore - vyAfter;

    // Is it a local peak in y (deepest point in screen)?
    const isLocalMaxY = ptCurr.y >= ptPrev.y && ptCurr.y >= ptNext.y;

    if (isLocalMaxY && vyBefore > 0 && vyAfter < 0 && vyChange > 40) {
      if (vyChange > maxVyChange) {
        maxVyChange = vyChange;
        bestPeakIdx = i;
      }
    }
  }

  if (bestPeakIdx >= 2) {
    return {
      hasBounce: true,
      bounceIndex: bestPeakIdx,
      bounceTime: track[bestPeakIdx].t,
      preBouncePoints: track.slice(0, bestPeakIdx + 1),
      postBouncePoints: track.slice(bestPeakIdx),
    };
  }

  return {
    hasBounce: false,
    bounceIndex: -1,
    preBouncePoints: track,
    postBouncePoints: [],
  };
}
