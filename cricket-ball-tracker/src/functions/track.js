import { applyH } from './homography.js';
import { KalmanBallFilter, rtsSmooth } from './kalman.js';

/**
 * Single delivery trajectory tracker
 */
export class BallTracker {
  constructor(options = {}) {
    this.calibration = options.calibration || null;
    this.filter = new KalmanBallFilter();
    this.state = 'idle'; // 'idle' | 'tracking' | 'finished'
    this.rawTrack = []; // List of accepted/coasted detections per frame
    this.filterHistory = []; // Stored state and covariances for RTS
    this.consecutiveMisses = 0;
    this.maxConsecutiveMisses = 4;
    this.bounceCounter = 0;
    this.pendingCandidates = []; // Buffers 1st frame candidates to look for pair
  }

  reset() {
    this.state = 'idle';
    this.rawTrack = [];
    this.filterHistory = [];
    this.consecutiveMisses = 0;
    this.bounceCounter = 0;
    this.pendingCandidates = [];
  }

  setCalibration(calibration) {
    this.calibration = calibration;
  }

  /**
   * Check whether candidate pair moves in pitch direction at plausible speed (5 to 70 m/s)
   */
  isValidPair(c1, c2, dt) {
    if (dt <= 0 || dt > 0.1) return false;

    if (this.calibration && this.calibration.H) {
      const [X1, Z1] = applyH(this.calibration.H, c1.x, c1.y);
      const [X2, Z2] = applyH(this.calibration.H, c2.x, c2.y);

      const dX = X2 - X1;
      const dZ = Z2 - Z1;
      const dist = Math.sqrt(dX * dX + dZ * dZ);
      const speed = dist / dt;

      // Must move in pitch direction (dX > 0) towards striker end, speed 5 to 70 m/s
      if (dX > 0 && speed >= 5 && speed <= 70) {
        return { valid: true, speed, vx: (c2.x - c1.x) / dt, vy: (c2.y - c1.y) / dt };
      }
    } else {
      // Fallback pixel heuristic if no calibration yet
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      const pixelSpeed = Math.sqrt(dx * dx + dy * dy) / dt;
      if (dx > 0 && pixelSpeed >= 150 && pixelSpeed <= 4000) {
        return { valid: true, speed: pixelSpeed / 30, vx: dx / dt, vy: dy / dt };
      }
    }

    return { valid: false };
  }

  /**
   * Process a frame's candidates
   * @param {Array} candidates - Detected candidates in current frame
   * @param {number} t - Timestamp
   */
  processFrame(candidates, t) {
    if (this.state === 'finished') return null;

    if (this.state === 'idle') {
      if (this.pendingCandidates.length === 0) {
        if (candidates.length > 0) {
          this.pendingCandidates = candidates;
        }
        return null;
      }

      // Check pairs between pendingCandidates (tPrev) and candidates (curr)
      const tPrev = this.pendingCandidates[0].t;
      const dt = t - tPrev;

      let bestPair = null;
      let bestScore = -1;

      for (const prev of this.pendingCandidates) {
        for (const curr of candidates) {
          const check = this.isValidPair(prev, curr, dt);
          if (check.valid) {
            const pairScore = prev.score + curr.score;
            if (pairScore > bestScore) {
              bestScore = pairScore;
              bestPair = { prev, curr, vx: check.vx, vy: check.vy };
            }
          }
        }
      }

      if (bestPair) {
        // Initialize Kalman filter
        this.filter.init(bestPair.prev.x, bestPair.prev.y, bestPair.vx, bestPair.vy);

        // Store first point
        this.rawTrack.push({
          t: bestPair.prev.t,
          x: bestPair.prev.x,
          y: bestPair.prev.y,
          r: bestPair.prev.r,
          score: bestPair.prev.score,
          isCoasted: false,
          interpolated: false,
        });
        this.filterHistory.push({
          state: [...this.filter.state],
          P: this.filter.P,
          statePred: [...this.filter.state],
          Ppred: this.filter.P,
          F: [
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ],
        });

        // Predict and update second point
        const { statePred, Ppred, F } = this.filter.predict(dt);
        const { invS } = this.filter.getInnovationCovariance(Ppred);
        this.filter.update(bestPair.curr.x, bestPair.curr.y, statePred, Ppred, invS);

        this.rawTrack.push({
          t: bestPair.curr.t,
          x: bestPair.curr.x,
          y: bestPair.curr.y,
          r: bestPair.curr.r,
          score: bestPair.curr.score,
          isCoasted: false,
          interpolated: false,
        });
        this.filterHistory.push({
          state: [...this.filter.state],
          P: this.filter.P,
          statePred,
          Ppred,
          F,
        });

        this.state = 'tracking';
        this.consecutiveMisses = 0;
        this.pendingCandidates = [];
        return this.rawTrack[this.rawTrack.length - 1];
      } else {
        // Shift pending candidates to current frame
        this.pendingCandidates = candidates;
        return null;
      }
    }

    // Active tracking
    const lastPoint = this.rawTrack[this.rawTrack.length - 1];
    const dt = t - lastPoint.t;
    if (dt <= 0) return null;

    // Bounce handling: inflate Q x10 when predicted height falls below 0.2m (side-on mode)
    let qMultiplier = 1.0;
    if (this.calibration && this.calibration.mode === 'sideOn') {
      const [pxPredApprox, pyPredApprox] = [
        this.filter.state[0] + this.filter.state[2] * dt,
        this.filter.state[1] + this.filter.state[3] * dt,
      ];
      try {
        const [, predZ] = applyH(this.calibration.H, pxPredApprox, pyPredApprox);
        if (predZ < 0.25) {
          this.bounceCounter = 2;
        }
      } catch {
        // Ignore homography inversion edge
      }
    }

    if (this.bounceCounter > 0) {
      qMultiplier = 10.0;
      this.bounceCounter--;
    }

    const { statePred, Ppred, F } = this.filter.predict(dt, qMultiplier);
    const { invS } = this.filter.getInnovationCovariance(Ppred);

    // Gate candidates: Mahalanobis d^2 < 9.21 (99% confidence for 2 DOF)
    let bestCandidate = null;
    let bestMetric = -1;

    for (const cand of candidates) {
      const dSq = this.filter.mahalanobisDistanceSq(cand.x, cand.y, statePred, invS);
      if (dSq < 9.21) {
        // Choose candidate with best score * exp(-dSq / 2)
        const metric = cand.score * Math.exp(-dSq / 2);
        if (metric > bestMetric) {
          bestMetric = metric;
          bestCandidate = cand;
        }
      }
    }

    if (bestCandidate) {
      this.filter.update(bestCandidate.x, bestCandidate.y, statePred, Ppred, invS);
      const pt = {
        t,
        x: bestCandidate.x,
        y: bestCandidate.y,
        r: bestCandidate.r,
        score: bestCandidate.score,
        vx: this.filter.state[2],
        vy: this.filter.state[3],
        isCoasted: false,
        interpolated: false,
      };
      this.rawTrack.push(pt);
      this.filterHistory.push({
        state: [...this.filter.state],
        P: this.filter.P,
        statePred,
        Ppred,
        F,
      });
      this.consecutiveMisses = 0;
      return pt;
    } else {
      // Coast on prediction
      this.consecutiveMisses++;
      this.filter.state = [...statePred];
      this.filter.P = Ppred;

      const pt = {
        t,
        x: statePred[0],
        y: statePred[1],
        r: 10,
        score: 0.2,
        vx: statePred[2],
        vy: statePred[3],
        isCoasted: true,
        interpolated: true,
      };
      this.rawTrack.push(pt);
      this.filterHistory.push({
        state: [...this.filter.state],
        P: this.filter.P,
        statePred,
        Ppred,
        F,
      });

      if (this.consecutiveMisses >= this.maxConsecutiveMisses) {
        this.finish();
      }
      return pt;
    }
  }

  finish() {
    this.state = 'finished';
  }

  /**
   * Finalize track: prune trailing coasted points, run gap filling and RTS smoothing
   */
  finalize() {
    // Trim trailing coasted points
    while (this.rawTrack.length > 0 && this.rawTrack[this.rawTrack.length - 1].isCoasted) {
      this.rawTrack.pop();
      this.filterHistory.pop();
    }

    if (this.rawTrack.length < 4) {
      return { rawPoints: this.rawTrack, displayPoints: this.rawTrack };
    }

    // Gap filling: interpolate coasted gaps using cubic Hermite
    const filledPoints = [...this.rawTrack];
    for (let i = 1; i < filledPoints.length - 1; i++) {
      if (filledPoints[i].isCoasted) {
        // Find segment bounds
        let leftIdx = i - 1;
        while (leftIdx > 0 && filledPoints[leftIdx].isCoasted) leftIdx--;

        let rightIdx = i + 1;
        while (rightIdx < filledPoints.length - 1 && filledPoints[rightIdx].isCoasted) rightIdx++;

        const pA = filledPoints[leftIdx];
        const pB = filledPoints[rightIdx];

        const tA = pA.t;
        const tB = pB.t;
        const deltaT = tB - tA;

        if (deltaT > 0) {
          const u = (filledPoints[i].t - tA) / deltaT;
          const u2 = u * u;
          const u3 = u2 * u;

          const h00 = 2 * u3 - 3 * u2 + 1;
          const h10 = u3 - 2 * u2 + u;
          const h01 = -2 * u3 + 3 * u2;
          const h11 = u3 - u2;

          const vxA = pA.vx || (pB.x - pA.x) / deltaT;
          const vyA = pA.vy || (pB.y - pA.y) / deltaT;
          const vxB = pB.vx || (pB.x - pA.x) / deltaT;
          const vyB = pB.vy || (pB.y - pA.y) / deltaT;

          filledPoints[i].x = h00 * pA.x + h10 * deltaT * vxA + h01 * pB.x + h11 * deltaT * vxB;
          filledPoints[i].y = h00 * pA.y + h10 * deltaT * vyA + h01 * pB.y + h11 * deltaT * vyB;
          filledPoints[i].interpolated = true;
        }
      }
    }

    // RTS backward smoothing for display trajectory
    const smoothedHistory = rtsSmooth(this.filterHistory);
    const displayPoints = filledPoints.map((pt, idx) => {
      const sm = smoothedHistory[idx];
      return {
        ...pt,
        displayX: sm ? sm.state[0] : pt.x,
        displayY: sm ? sm.state[1] : pt.y,
      };
    });

    return {
      rawPoints: filledPoints,
      displayPoints,
    };
  }
}
