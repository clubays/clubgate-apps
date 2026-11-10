import { TrackPoint } from '@/types';
import { Kalman2D } from './kalman2D';

export interface DetectionMeasurement {
  x: number; // working frame coordinates
  y: number;
  confidence: number;
}

export class TrackManager {
  public id: number;
  public hits: number = 0;
  public misses: number = 0;
  public isConfirmed: boolean = false;
  public isLost: boolean = false;
  public kalman: Kalman2D | null = null;
  public points: TrackPoint[] = [];

  private lastTime: number = 0;
  private scaleX: number = 1;
  private scaleY: number = 1;

  constructor(id: number, origW: number, origH: number, workW: number, workH: number) {
    this.id = id;
    this.scaleX = origW / Math.max(1, workW);
    this.scaleY = origH / Math.max(1, workH);
  }

  public updateScales(origW: number, origH: number, workW: number, workH: number): void {
    this.scaleX = origW / Math.max(1, workW);
    this.scaleY = origH / Math.max(1, workH);
  }

  /**
   * Initializes or re-initializes tracking with a fresh detection
   */
  public initialize(detection: DetectionMeasurement, t: number): void {
    this.kalman = new Kalman2D(detection.x, detection.y);
    this.hits = 1;
    this.misses = 0;
    this.isConfirmed = false;
    this.isLost = false;
    this.lastTime = t;
    this.points.push({
      t,
      x: detection.x * this.scaleX,
      y: detection.y * this.scaleY,
      conf: detection.confidence,
    });
  }

  /**
   * Predicts Kalman state ahead to timestamp t and returns the search ROI
   */
  public predict(t: number): { x: number; y: number; searchRadius: number } | null {
    if (!this.kalman || this.isLost) return null;

    if (this.hits < 2) {
      // First hit only: search around initial detection within max speed displacement
      return {
        x: this.kalman.state[0],
        y: this.kalman.state[1],
        searchRadius: 85,
      };
    }

    const dt = this.lastTime > 0 ? Math.max(1e-4, t - this.lastTime) : 0.016;
    const pred = this.kalman.predict(dt);
    const { searchRadius } = this.kalman.getMahalanobisDistanceSq(pred.x, pred.y);
    const minRadius = this.hits < 3 ? 55 : 24;

    return {
      x: pred.x,
      y: pred.y,
      searchRadius: Math.max(minRadius, searchRadius),
    };
  }

  /**
   * Integrates an observation at timestamp t.
   * If detection is null, handles a miss.
   */
  public update(detection: DetectionMeasurement | null, t: number): void {
    if (!this.kalman || this.isLost) {
      if (detection) {
        this.initialize(detection, t);
      }
      return;
    }

    const dt = this.lastTime > 0 ? Math.max(1e-4, t - this.lastTime) : 0.016;

    if (detection) {
      if (this.hits === 1) {
        // Tentative second hit: accept if within reasonable displacement
        const dist = Math.hypot(detection.x - this.kalman.state[0], detection.y - this.kalman.state[1]);
        if (dist <= 85) {
          const vx = (detection.x - this.kalman.state[0]) / dt;
          const vy = (detection.y - this.kalman.state[1]) / dt;
          this.kalman.state[0] = detection.x;
          this.kalman.state[1] = detection.y;
          this.kalman.state[2] = vx;
          this.kalman.state[3] = vy;
          this.hits++;
          this.misses = 0;
          this.lastTime = t;
          this.points.push({
            t,
            x: detection.x * this.scaleX,
            y: detection.y * this.scaleY,
            conf: detection.confidence,
          });
          return;
        }
      } else {
        // Hits >= 2: Kalman prediction & Mahalanobis gating
        const { d2 } = this.kalman.getMahalanobisDistanceSq(detection.x, detection.y);
        const maxD2 = this.hits < 3 ? 35.0 : 20.0;

        if (d2 <= maxD2) {
          this.kalman.update(detection.x, detection.y);
          this.hits++;
          this.misses = 0;
          this.lastTime = t;

          if (this.hits >= 3) {
            this.isConfirmed = true;
          }

          this.points.push({
            t,
            x: detection.x * this.scaleX,
            y: detection.y * this.scaleY,
            conf: detection.confidence,
          });
          return;
        }
      }
    }

    this.lastTime = t;
    this.misses++;
    if (this.misses >= 4) {
      this.isLost = true;
    }
  }

  public reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.isConfirmed = false;
    this.isLost = false;
    this.kalman = null;
    this.points = [];
    this.lastTime = 0;
  }
}
