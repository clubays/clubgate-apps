/**
 * 4-state constant velocity Kalman filter for ball tracking [x, y, vx, vy]
 * Includes Mahalanobis distance gating, covariance prediction, update, and RTS smoothing
 */

export class KalmanBallFilter {
  constructor(options = {}) {
    this.q = options.q || 4000; // Process noise intensity (px/s^2)^2
    this.r = options.r || (1.5 * 1.5); // Measurement noise variance (px^2)
    this.state = [0, 0, 0, 0]; // [x, y, vx, vy]
    // Initial covariance
    this.P = [
      [100, 0, 0, 0],
      [0, 100, 0, 0],
      [0, 0, 1000, 0],
      [0, 0, 0, 1000],
    ];
  }

  init(x, y, vx = 0, vy = 0) {
    this.state = [x, y, vx, vy];
    this.P = [
      [10, 0, 0, 0],
      [0, 10, 0, 0],
      [0, 0, 500, 0],
      [0, 0, 0, 500],
    ];
  }

  /**
   * Predict next state with time step dt
   * @param {number} dt - Time delta in seconds
   * @param {number} qMultiplier - Multiplier for bounce / maneuver inflation
   */
  predict(dt, qMultiplier = 1.0) {
    if (dt <= 0) dt = 1 / 60;

    const [x, y, vx, vy] = this.state;
    // x = x + vx * dt
    // y = y + vy * dt
    const xPred = x + vx * dt;
    const yPred = y + vy * dt;
    const vxPred = vx;
    const vyPred = vy;

    const dt2 = dt * dt;
    const dt3 = dt2 * dt;
    const dt4 = dt3 * dt;
    const qEff = this.q * qMultiplier;

    // Process noise covariance Q
    const Q = [
      [qEff * dt4 / 4, 0, qEff * dt3 / 2, 0],
      [0, qEff * dt4 / 4, 0, qEff * dt3 / 2],
      [qEff * dt3 / 2, 0, qEff * dt2, 0],
      [0, qEff * dt3 / 2, 0, qEff * dt2],
    ];

    // F * P * F^T + Q
    const P = this.P;
    const Ppred = [
      [
        P[0][0] + dt * (P[2][0] + P[0][2]) + dt2 * P[2][2] + Q[0][0],
        P[0][1] + dt * (P[2][1] + P[0][3]) + dt2 * P[2][3] + Q[0][1],
        P[0][2] + dt * P[2][2] + Q[0][2],
        P[0][3] + dt * P[2][3] + Q[0][3],
      ],
      [
        P[1][0] + dt * (P[3][0] + P[1][2]) + dt2 * P[3][2] + Q[1][0],
        P[1][1] + dt * (P[3][1] + P[1][3]) + dt2 * P[3][3] + Q[1][1],
        P[1][2] + dt * P[3][2] + Q[1][2],
        P[1][3] + dt * P[3][3] + Q[1][3],
      ],
      [
        P[2][0] + dt * P[2][2] + Q[2][0],
        P[2][1] + dt * P[2][3] + Q[2][1],
        P[2][2] + Q[2][2],
        P[2][3] + Q[2][3],
      ],
      [
        P[3][0] + dt * P[3][2] + Q[3][0],
        P[3][1] + dt * P[3][3] + Q[3][1],
        P[3][2] + Q[3][2],
        P[3][3] + Q[3][3],
      ],
    ];

    return {
      statePred: [xPred, yPred, vxPred, vyPred],
      Ppred,
      F: [
        [1, 0, dt, 0],
        [0, 1, 0, dt],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ],
    };
  }

  /**
   * Compute innovation covariance S and its inverse
   */
  getInnovationCovariance(Ppred) {
    const r = this.r;
    const S00 = Ppred[0][0] + r;
    const S01 = Ppred[0][1];
    const S10 = Ppred[1][0];
    const S11 = Ppred[1][1] + r;

    const det = S00 * S11 - S01 * S10;
    const invDet = 1.0 / (Math.abs(det) < 1e-12 ? 1e-12 : det);

    return {
      S: [
        [S00, S01],
        [S10, S11],
      ],
      invS: [
        [S11 * invDet, -S01 * invDet],
        [-S10 * invDet, S00 * invDet],
      ],
    };
  }

  /**
   * Mahalanobis distance squared between prediction and measurement [zx, zy]
   */
  mahalanobisDistanceSq(measX, measY, statePred, invS) {
    const dx = measX - statePred[0];
    const dy = measY - statePred[1];

    const dSq =
      dx * (invS[0][0] * dx + invS[0][1] * dy) +
      dy * (invS[1][0] * dx + invS[1][1] * dy);

    return Math.max(0, dSq);
  }

  /**
   * Update filter with measurement
   */
  update(measX, measY, statePred, Ppred, invS) {
    const yx = measX - statePred[0];
    const yy = measY - statePred[1];

    // Kalman gain K = Ppred * H^T * invS (4x2 matrix)
    // H = [[1,0,0,0],[0,1,0,0]]
    // Ppred * H^T is the first two columns of Ppred
    const K = [
      [
        Ppred[0][0] * invS[0][0] + Ppred[0][1] * invS[1][0],
        Ppred[0][0] * invS[0][1] + Ppred[0][1] * invS[1][1],
      ],
      [
        Ppred[1][0] * invS[0][0] + Ppred[1][1] * invS[1][0],
        Ppred[1][0] * invS[0][1] + Ppred[1][1] * invS[1][1],
      ],
      [
        Ppred[2][0] * invS[0][0] + Ppred[2][1] * invS[1][0],
        Ppred[2][0] * invS[0][1] + Ppred[2][1] * invS[1][1],
      ],
      [
        Ppred[3][0] * invS[0][0] + Ppred[3][1] * invS[1][0],
        Ppred[3][0] * invS[0][1] + Ppred[3][1] * invS[1][1],
      ],
    ];

    // state = statePred + K * y
    this.state = [
      statePred[0] + K[0][0] * yx + K[0][1] * yy,
      statePred[1] + K[1][0] * yx + K[1][1] * yy,
      statePred[2] + K[2][0] * yx + K[2][1] * yy,
      statePred[3] + K[3][0] * yx + K[3][1] * yy,
    ];

    // P = (I - K*H) * Ppred
    // KH is 4x4 matrix where row i has KH[i][0] = K[i][0], KH[i][1] = K[i][1], rest 0
    const newP = [new Array(4), new Array(4), new Array(4), new Array(4)];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const I_ij = i === j ? 1 : 0;
        const kh0 = K[i][0];
        const kh1 = K[i][1];

        // Row i of (I - K*H) * Ppred
        newP[i][j] =
          (I_ij - 0) * Ppred[i][j] -
          (kh0 * Ppred[0][j] + kh1 * Ppred[1][j]);
      }
    }

    this.P = newP;
    return this.state;
  }
}

/**
 * 4x4 matrix inversion helper for RTS smoother
 */
function invert4(M) {
  // Gaussian elimination to invert 4x4
  const A = M.map((row) => [...row]);
  const inv = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  for (let i = 0; i < 4; i++) {
    let pivot = i;
    for (let r = i + 1; r < 4; r++) {
      if (Math.abs(A[r][i]) > Math.abs(A[pivot][i])) pivot = r;
    }
    if (pivot !== i) {
      [A[i], A[pivot]] = [A[pivot], A[i]];
      [inv[i], inv[pivot]] = [inv[pivot], inv[i]];
    }

    const div = A[i][i] || 1e-12;
    for (let c = 0; c < 4; c++) {
      A[i][c] /= div;
      inv[i][c] /= div;
    }

    for (let r = 0; r < 4; r++) {
      if (r !== i) {
        const factor = A[r][i];
        for (let c = 0; c < 4; c++) {
          A[r][c] -= factor * A[i][c];
          inv[r][c] -= factor * inv[i][c];
        }
      }
    }
  }

  return inv;
}

/**
 * Rauch–Tung–Striebel (RTS) backward smoothing pass
 * @param {Array<{state: number[], P: number[][], statePred: number[], Ppred: number[][], F: number[][]}>} history
 */
export function rtsSmooth(history) {
  if (!history || history.length === 0) return [];
  const N = history.length;
  const smoothed = new Array(N);

  smoothed[N - 1] = {
    state: [...history[N - 1].state],
    P: history[N - 1].P,
  };

  for (let k = N - 2; k >= 0; k--) {
    const curr = history[k];
    const nxt = history[k + 1];

    const invPpred = invert4(nxt.Ppred);

    // C = P_k * F^T * invPpred
    // F^T
    const FT = [
      [nxt.F[0][0], nxt.F[1][0], nxt.F[2][0], nxt.F[3][0]],
      [nxt.F[0][1], nxt.F[1][1], nxt.F[2][1], nxt.F[3][1]],
      [nxt.F[0][2], nxt.F[1][2], nxt.F[2][2], nxt.F[3][2]],
      [nxt.F[0][3], nxt.F[1][3], nxt.F[2][3], nxt.F[3][3]],
    ];

    // P_k * F^T
    const PF = [new Array(4), new Array(4), new Array(4), new Array(4)];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let m = 0; m < 4; m++) s += curr.P[r][m] * FT[m][c];
        PF[r][c] = s;
      }
    }

    // C = (P_k * F^T) * invPpred
    const C = [new Array(4), new Array(4), new Array(4), new Array(4)];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let s = 0;
        for (let m = 0; m < 4; m++) s += PF[r][m] * invPpred[m][c];
        C[r][c] = s;
      }
    }

    // x_k|N = x_k + C * (x_{k+1|N} - x_{k+1|k})
    const diffX = [
      smoothed[k + 1].state[0] - nxt.statePred[0],
      smoothed[k + 1].state[1] - nxt.statePred[1],
      smoothed[k + 1].state[2] - nxt.statePred[2],
      smoothed[k + 1].state[3] - nxt.statePred[3],
    ];

    const smX = [...curr.state];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        smX[r] += C[r][c] * diffX[c];
      }
    }

    smoothed[k] = {
      state: smX,
      P: curr.P,
    };
  }

  return smoothed;
}
