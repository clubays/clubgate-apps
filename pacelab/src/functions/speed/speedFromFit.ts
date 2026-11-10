import { LineSegment, TrackPoint } from '@/types';
import { distance } from '@/utils/geometry';
import { linearRegression } from '@/utils/math';

export interface SpeedFitResult {
  mps: number;
  r2: number;
  stdErr: number;
  sampleCount: number;
}

/**
 * Computes speed by performing least-squares regression of along-pitch metric distance
 * against time with one robust re-weighting outlier rejection pass.
 */
export function speedFromFit(
  track: TrackPoint[],
  gateA: LineSegment,
  gateB: LineSegment,
  pixelsPerMetre: number
): SpeedFitResult {
  if (track.length < 3 || pixelsPerMetre <= 0) {
    return { mps: 0, r2: 0, stdErr: 0, sampleCount: track.length };
  }

  // Pitch axis unit vector
  const midA = { x: (gateA.p1.x + gateA.p2.x) / 2, y: (gateA.p1.y + gateA.p2.y) / 2 };
  const midB = { x: (gateB.p1.x + gateB.p2.x) / 2, y: (gateB.p1.y + gateB.p2.y) / 2 };

  const dx = midB.x - midA.x;
  const dy = midB.y - midA.y;
  const axisLength = distance(midA, midB);

  if (axisLength < 1e-4) {
    return { mps: 0, r2: 0, stdErr: 0, sampleCount: track.length };
  }

  const uX = dx / axisLength;
  const uY = dy / axisLength;

  // Project points onto pitch axis and convert to metres
  const tVals: number[] = [];
  const sVals: number[] = [];

  for (const pt of track) {
    const projPx = (pt.x - midA.x) * uX + (pt.y - midA.y) * uY;
    const sMeters = projPx / pixelsPerMetre;
    tVals.push(pt.t);
    sVals.push(sMeters);
  }

  // Pass 1: standard OLS regression
  const ols = linearRegression(tVals, sVals);

  // Compute residuals
  const residuals: number[] = [];
  for (let i = 0; i < tVals.length; i++) {
    const pred = ols.slope * tVals[i] + ols.intercept;
    residuals.push(Math.abs(sVals[i] - pred));
  }

  // Robust scale estimate (median absolute residual)
  const sortedRes = [...residuals].sort((a, b) => a - b);
  const medianRes = sortedRes[Math.floor(sortedRes.length / 2)] || 1e-4;
  const cutoff = Math.max(0.05, 2.5 * medianRes);

  // Pass 2: Robust Weighted Least Squares (Huber / bisquare weights)
  let sumW = 0;
  let sumWT = 0;
  let sumWS = 0;
  let inlierCount = 0;

  for (let i = 0; i < tVals.length; i++) {
    const res = residuals[i];
    // Huber weights
    const w = res <= cutoff ? 1.0 : cutoff / res;
    sumW += w;
    sumWT += w * tVals[i];
    sumWS += w * sVals[i];
    if (res <= cutoff) inlierCount++;
  }

  if (sumW < 1e-4 || inlierCount < 2) {
    return {
      mps: Math.abs(ols.slope),
      r2: ols.r2,
      stdErr: ols.stdErr,
      sampleCount: tVals.length,
    };
  }

  const tBar = sumWT / sumW;
  const sBar = sumWS / sumW;

  let num = 0;
  let den = 0;
  for (let i = 0; i < tVals.length; i++) {
    const res = residuals[i];
    const w = res <= cutoff ? 1.0 : cutoff / res;
    const dt = tVals[i] - tBar;
    const ds = sVals[i] - sBar;
    num += w * dt * ds;
    den += w * dt * dt;
  }

  const robustSlope = den > 1e-9 ? num / den : ols.slope;
  const robustIntercept = sBar - robustSlope * tBar;

  // Recompute R² and std error using robust model
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < tVals.length; i++) {
    const pred = robustSlope * tVals[i] + robustIntercept;
    const res = sVals[i] - pred;
    ssRes += res * res;
    ssTot += Math.pow(sVals[i] - sBar, 2);
  }

  const r2 = ssTot > 1e-9 ? Math.max(0, 1 - ssRes / ssTot) : ols.r2;
  const stdErr = tVals.length > 2 ? Math.sqrt(ssRes / (tVals.length - 2)) : 0;

  return {
    mps: Math.abs(robustSlope),
    r2,
    stdErr,
    sampleCount: tVals.length,
  };
}
