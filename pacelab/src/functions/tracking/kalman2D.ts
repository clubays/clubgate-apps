export interface KalmanState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class Kalman2D {
  // State vector [x, y, vx, vy]
  public state: [number, number, number, number];
  // Covariance matrix 4x4 stored as flat 16-element array
  public P: Float64Array;
  // Acceleration spectral density / process noise intensity
  private qAccel: number;
  // Measurement noise variance
  private rMeas: number;

  constructor(
    initX: number,
    initY: number,
    initVx = 0,
    initVy = 0,
    qAccel = 300,
    rMeas = 4.0
  ) {
    this.state = [initX, initY, initVx, initVy];
    this.qAccel = qAccel;
    this.rMeas = rMeas;

    this.P = new Float64Array(16);
    // Initialize P with moderate uncertainty on position, higher on velocity
    this.P[0] = 10;   // P(0,0)
    this.P[5] = 10;   // P(1,1)
    this.P[10] = 500; // P(2,2)
    this.P[15] = 500; // P(3,3)
  }

  /**
   * Predicts next state given time delta dt in seconds
   */
  public predict(dt: number): KalmanState {
    const dtSafe = Math.max(1e-4, Math.min(0.2, dt));

    // 1. x_pred = F * x
    const x = this.state[0] + this.state[2] * dtSafe;
    const y = this.state[1] + this.state[3] * dtSafe;
    const vx = this.state[2];
    const vy = this.state[3];
    this.state[0] = x;
    this.state[1] = y;
    this.state[2] = vx;
    this.state[3] = vy;

    // 2. P_pred = F * P * F^T + Q
    // For CWNA model:
    const dt2 = dtSafe * dtSafe;
    const dt3 = dt2 * dtSafe;
    const q1 = (dt3 / 3) * this.qAccel;
    const q2 = (dt2 / 2) * this.qAccel;
    const q3 = dtSafe * this.qAccel;

    const p = this.P;
    // F * P
    const FP0 = p[0] + dtSafe * p[8];
    const FP1 = p[1] + dtSafe * p[9];
    const FP2 = p[2] + dtSafe * p[10];
    const FP3 = p[3] + dtSafe * p[11];

    const FP4 = p[4] + dtSafe * p[12];
    const FP5 = p[5] + dtSafe * p[13];
    const FP6 = p[6] + dtSafe * p[14];
    const FP7 = p[7] + dtSafe * p[15];

    const FP8 = p[8];
    const FP9 = p[9];
    const FP10 = p[10];
    const FP11 = p[11];

    const FP12 = p[12];
    const FP13 = p[13];
    const FP14 = p[14];
    const FP15 = p[15];

    // (F*P) * F^T + Q
    p[0] = FP0 + dtSafe * FP2 + q1;
    p[1] = FP1 + dtSafe * FP3;
    p[2] = FP2 + q2;
    p[3] = FP3;

    p[4] = FP4 + dtSafe * FP6;
    p[5] = FP5 + dtSafe * FP7 + q1;
    p[6] = FP6;
    p[7] = FP7 + q2;

    p[8] = FP8 + dtSafe * FP10 + q2;
    p[9] = FP9 + dtSafe * FP11;
    p[10] = FP10 + q3;
    p[11] = FP11;

    p[12] = FP12 + dtSafe * FP14;
    p[13] = FP13 + dtSafe * FP15 + q2;
    p[14] = FP14;
    p[15] = FP15 + q3;

    return { x, y, vx, vy };
  }

  /**
   * Mahalanobis distance squared for measurement gating
   * chi-square 99% threshold with 2 DOF is ~9.21
   */
  public getMahalanobisDistanceSq(measX: number, measY: number): { d2: number; searchRadius: number } {
    const rx = measX - this.state[0];
    const ry = measY - this.state[1];

    // S = H * P * H^T + R
    const s00 = this.P[0] + this.rMeas;
    const s01 = this.P[1];
    const s10 = this.P[4];
    const s11 = this.P[5] + this.rMeas;

    const det = s00 * s11 - s01 * s10;
    if (Math.abs(det) < 1e-9) {
      return { d2: 0, searchRadius: 20 };
    }

    const invS00 = s11 / det;
    const invS01 = -s01 / det;
    const invS10 = -s10 / det;
    const invS11 = s00 / det;

    const d2 = rx * (invS00 * rx + invS10 * ry) + ry * (invS01 * rx + invS11 * ry);
    // 3-sigma search radius in pixel units
    const searchRadius = Math.max(16, 3 * Math.sqrt(Math.max(s00, s11)));

    return { d2, searchRadius };
  }

  /**
   * Updates state with measurement [measX, measY]
   */
  public update(measX: number, measY: number): KalmanState {
    const y0 = measX - this.state[0];
    const y1 = measY - this.state[1];

    const p = this.P;
    const s00 = p[0] + this.rMeas;
    const s01 = p[1];
    const s10 = p[4];
    const s11 = p[5] + this.rMeas;

    const det = s00 * s11 - s01 * s10;
    if (Math.abs(det) < 1e-9) {
      return { x: this.state[0], y: this.state[1], vx: this.state[2], vy: this.state[3] };
    }

    const inv00 = s11 / det;
    const inv01 = -s01 / det;
    const inv10 = -s10 / det;
    const inv11 = s00 / det;

    // Kalman gain K = P * H^T * inv(S) (4x2 matrix)
    // P * H^T = [[p0, p1], [p4, p5], [p8, p9], [p12, p13]]
    const k00 = p[0] * inv00 + p[1] * inv10;
    const k01 = p[0] * inv01 + p[1] * inv11;

    const k10 = p[4] * inv00 + p[5] * inv10;
    const k11 = p[4] * inv01 + p[5] * inv11;

    const k20 = p[8] * inv00 + p[9] * inv10;
    const k21 = p[8] * inv01 + p[9] * inv11;

    const k30 = p[12] * inv00 + p[13] * inv10;
    const k31 = p[12] * inv01 + p[13] * inv11;

    // x = x + K * y
    this.state[0] += k00 * y0 + k01 * y1;
    this.state[1] += k10 * y0 + k11 * y1;
    this.state[2] += k20 * y0 + k21 * y1;
    this.state[3] += k30 * y0 + k31 * y1;

    // Joseph-form or standard covariance update: P = (I - K*H) * P
    const I_KH00 = 1 - k00;
    const I_KH01 = -k01;
    const I_KH10 = -k10;
    const I_KH11 = 1 - k11;
    const I_KH20 = -k20;
    const I_KH21 = -k21;
    const I_KH30 = -k30;
    const I_KH31 = -k31;

    // Compute updated P
    const pNew = new Float64Array(16);
    for (let col = 0; col < 4; col++) {
      pNew[0 * 4 + col] = I_KH00 * p[0 * 4 + col] + I_KH01 * p[1 * 4 + col];
      pNew[1 * 4 + col] = I_KH10 * p[0 * 4 + col] + I_KH11 * p[1 * 4 + col];
      pNew[2 * 4 + col] = I_KH20 * p[0 * 4 + col] + I_KH21 * p[1 * 4 + col] + p[2 * 4 + col];
      pNew[3 * 4 + col] = I_KH30 * p[0 * 4 + col] + I_KH31 * p[1 * 4 + col] + p[3 * 4 + col];
    }
    this.P.set(pNew);

    return {
      x: this.state[0],
      y: this.state[1],
      vx: this.state[2],
      vy: this.state[3],
    };
  }
}
