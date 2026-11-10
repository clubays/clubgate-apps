import { ConfidenceLevel, DeliveryMethod } from '@/types';

export interface UncertaintyEvaluation {
  uncertaintyMps: number;
  confidence: ConfidenceLevel;
  primaryMethod: DeliveryMethod;
  headlineSpeedMps: number;
  gateSpeedMps?: number;
  fitSpeedMps?: number;
  discrepancyPercent: number;
  reasonsForLowConfidence: string[];
}

/**
 * Computes speed uncertainty according to error propagation:
 * σ_v ≈ v · sqrt( (√2·σ_t / Δt)² + (σ_d / D)² )
 * with σ_t = frameInterval / (2√3) and σ_d = 2px / pixelsPerMetre
 */
export function calculateSpeedUncertainty(
  vMps: number,
  deltaTSeconds: number,
  distanceMeters: number,
  pixelsPerMetre: number,
  frameIntervalSeconds: number = 1 / 60
): number {
  if (vMps <= 0 || deltaTSeconds <= 0 || distanceMeters <= 0) {
    return 0;
  }

  // Timing uncertainty for uniform quantization within frame interval: σ_t = Δt_frame / (2√3)
  const sigmaT = frameIntervalSeconds / (2 * Math.sqrt(3));
  // Spatial uncertainty: assume 2 px calibration click uncertainty converted to metres
  const sigmaD = 2 / Math.max(1, pixelsPerMetre);

  const termT = (Math.SQRT2 * sigmaT) / deltaTSeconds;
  const termD = sigmaD / distanceMeters;

  const sigmaV = vMps * Math.sqrt(termT * termT + termD * termD);
  return Math.max(0.05, sigmaV);
}

/**
 * Resolves headline speed, compares gate vs fit methods, and grades confidence
 */
export function evaluateSpeedResult(params: {
  gateSpeedMps?: number;
  fitSpeedMps?: number;
  r2: number;
  pointCount: number;
  deltaTSeconds: number;
  distanceMeters: number;
  pixelsPerMetre: number;
  frameIntervalSeconds?: number;
}): UncertaintyEvaluation {
  const {
    gateSpeedMps,
    fitSpeedMps,
    r2,
    pointCount,
    deltaTSeconds,
    distanceMeters,
    pixelsPerMetre,
    frameIntervalSeconds = 1 / 60,
  } = params;

  const hasGate = gateSpeedMps !== undefined && gateSpeedMps > 0;
  const hasFit = fitSpeedMps !== undefined && fitSpeedMps > 0;

  let primaryMethod: DeliveryMethod = 'gates';
  let headlineSpeedMps = 0;

  if (hasGate) {
    primaryMethod = 'gates';
    headlineSpeedMps = gateSpeedMps!;
  } else if (hasFit) {
    primaryMethod = 'fit';
    headlineSpeedMps = fitSpeedMps!;
  }

  const uncertaintyMps = calculateSpeedUncertainty(
    headlineSpeedMps,
    Math.max(0.05, deltaTSeconds),
    distanceMeters,
    pixelsPerMetre,
    frameIntervalSeconds
  );

  const reasons: string[] = [];

  if (pointCount < 4) {
    reasons.push(`Sparse track points (${pointCount} points, minimum 4 required).`);
  }

  if (r2 < 0.98) {
    reasons.push(`Trajectory linearity fit R² is ${r2.toFixed(3)} (< 0.98).`);
  }

  let discrepancyPercent = 0;
  if (hasGate && hasFit) {
    const maxSpeed = Math.max(gateSpeedMps!, fitSpeedMps!);
    discrepancyPercent = (Math.abs(gateSpeedMps! - fitSpeedMps!) / maxSpeed) * 100;
    if (discrepancyPercent > 6.0) {
      reasons.push(`Gate speed (${(gateSpeedMps! * 3.6).toFixed(1)} km/h) and fit speed (${(fitSpeedMps! * 3.6).toFixed(1)} km/h) diverge by ${discrepancyPercent.toFixed(1)}% (> 6%).`);
    }
  }

  const confidence: ConfidenceLevel = reasons.length === 0 ? 'high' : 'low';

  return {
    uncertaintyMps,
    confidence,
    primaryMethod,
    headlineSpeedMps,
    gateSpeedMps,
    fitSpeedMps,
    discrepancyPercent,
    reasonsForLowConfidence: reasons,
  };
}
