import { ConfidenceLevel, DeliveryMethod, DeliveryState, LineSegment, TrackPoint } from '@/types';
import { detectBounce } from '../speed/detectBounce';
import { evaluateGateCrossing } from '../speed/gateCrossing';
import { speedFromFit } from '../speed/speedFromFit';
import { speedFromGates } from '../speed/speedFromGates';
import { evaluateSpeedResult } from '../speed/uncertainty';

export interface DeliveryCaptureEvent {
  speedMps: number;
  gateSpeedMps?: number;
  fitSpeedMps?: number;
  uncertaintyMps: number;
  method: DeliveryMethod;
  preBounce: boolean;
  r2: number;
  confidence: ConfidenceLevel;
  track: TrackPoint[];
  crossedGateB: boolean;
  frameIndexAtGate?: number;
}

export class DeliveryStateMachine {
  public state: DeliveryState = 'IDLE';
  private cooldownStart: number = 0;
  private crossingA: { t: number; point: { x: number; y: number } } | null = null;
  private crossingB: { t: number; point: { x: number; y: number } } | null = null;
  private capturedEvent: DeliveryCaptureEvent | null = null;

  constructor(
    public minSpeedKmh: number = 40,
    public cooldownSeconds: number = 2.5
  ) {}

  public setArmed(armed: boolean): void {
    if (!armed) {
      this.state = 'IDLE';
      this.resetTrackingData();
    } else if (this.state === 'IDLE') {
      this.state = 'ARMED';
      this.resetTrackingData();
    }
  }

  private resetTrackingData(): void {
    this.crossingA = null;
    this.crossingB = null;
    this.capturedEvent = null;
  }

  /**
   * Main step function called on each processed frame
   */
  public step(params: {
    timestamp: number;
    isArmed: boolean;
    isConfirmed: boolean;
    isLost: boolean;
    trackPoints: TrackPoint[];
    gateA: LineSegment;
    gateB: LineSegment;
    distanceM: number;
    pixelsPerMetre: number;
    frameInterval?: number;
  }): { state: DeliveryState; captureEvent: DeliveryCaptureEvent | null } {
    const {
      timestamp,
      isArmed,
      isConfirmed,
      isLost,
      trackPoints,
      gateA,
      gateB,
      distanceM,
      pixelsPerMetre,
      frameInterval = 1 / 60,
    } = params;

    // Handle Arm/Disarm
    if (!isArmed) {
      this.state = 'IDLE';
      this.resetTrackingData();
      return { state: this.state, captureEvent: null };
    }

    if (this.state === 'IDLE' && isArmed) {
      this.state = 'ARMED';
      this.resetTrackingData();
    }

    // Handle Cooldown state
    if (this.state === 'COOLDOWN') {
      if (timestamp - this.cooldownStart >= this.cooldownSeconds) {
        this.state = 'ARMED';
        this.resetTrackingData();
      }
      return { state: this.state, captureEvent: null };
    }

    // Handle ARMED state
    if (this.state === 'ARMED') {
      if (isConfirmed && trackPoints.length >= 3) {
        // Evaluate rough speed over first few points
        const p1 = trackPoints[0];
        const pLast = trackPoints[trackPoints.length - 1];
        const dt = Math.max(1e-4, pLast.t - p1.t);
        const distPx = Math.hypot(pLast.x - p1.x, pLast.y - p1.y);
        const speedMps = (distPx / pixelsPerMetre) / dt;
        const speedKmh = speedMps * 3.6;

        if (speedKmh >= this.minSpeedKmh) {
          this.state = 'TRACKING';
        }
      }
      return { state: this.state, captureEvent: null };
    }

    // Handle TRACKING state
    if (this.state === 'TRACKING') {
      // Check gate crossing A
      if (!this.crossingA) {
        const hitA = evaluateGateCrossing(trackPoints, gateA);
        if (hitA) {
          this.crossingA = { t: hitA.t, point: hitA.point };
        }
      }

      // Check gate crossing B
      if (!this.crossingB) {
        const hitB = evaluateGateCrossing(trackPoints, gateB);
        if (hitB) {
          this.crossingB = { t: hitB.t, point: hitB.point };
        }
      }

      // Check capture condition:
      // 1. Both gates crossed
      // 2. Gate A crossed, but track lost before/at Gate B
      // 3. Track lost after moving substantial distance (fallback for fit-only)
      const crossedBoth = this.crossingA !== null && this.crossingB !== null;
      const crossedGateAAndLost = this.crossingA !== null && isLost;
      const substantialTrackAndLost = isLost && trackPoints.length >= 6;

      if (crossedBoth || crossedGateAAndLost || substantialTrackAndLost) {
        // Run bounce detection
        const bounce = detectBounce(trackPoints);
        const activeTrack = bounce.hasBounce ? bounce.preBouncePoints : trackPoints;

        // 1. Speed from Fit
        const fitResult = speedFromFit(activeTrack, gateA, gateB, pixelsPerMetre);

        // 2. Speed from Gates (if both gates crossed)
        let gateSpeedMps: number | undefined;
        let deltaT = fitResult.sampleCount > 1 ? trackPoints[trackPoints.length - 1].t - trackPoints[0].t : 0.2;

        if (this.crossingA && this.crossingB) {
          const gateRes = speedFromGates(this.crossingA.t, this.crossingB.t, distanceM);
          gateSpeedMps = gateRes.mps;
          deltaT = gateRes.dtSeconds;
        }

        // 3. Uncertainty evaluation
        const evalResult = evaluateSpeedResult({
          gateSpeedMps,
          fitSpeedMps: fitResult.mps,
          r2: fitResult.r2,
          pointCount: activeTrack.length,
          deltaTSeconds: deltaT,
          distanceMeters: distanceM,
          pixelsPerMetre,
          frameIntervalSeconds: frameInterval,
        });

        const captureEvent: DeliveryCaptureEvent = {
          speedMps: evalResult.headlineSpeedMps,
          gateSpeedMps: evalResult.gateSpeedMps,
          fitSpeedMps: evalResult.fitSpeedMps,
          uncertaintyMps: evalResult.uncertaintyMps,
          method: evalResult.primaryMethod,
          preBounce: bounce.hasBounce,
          r2: fitResult.r2,
          confidence: evalResult.confidence,
          track: [...trackPoints],
          crossedGateB: this.crossingB !== null,
        };

        this.state = 'CAPTURED';
        this.cooldownStart = timestamp;
        this.capturedEvent = captureEvent;

        return { state: 'CAPTURED', captureEvent };
      }
    }

    if (this.state === 'CAPTURED') {
      this.state = 'COOLDOWN';
      return { state: 'COOLDOWN', captureEvent: null };
    }

    return { state: this.state, captureEvent: null };
  }

  public reset(): void {
    this.state = 'IDLE';
    this.resetTrackingData();
  }
}
