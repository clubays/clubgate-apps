/**
 * Homography solve, apply, invert, and reprojection error
 */

/**
 * Solve 3x3 homography H such that dst ~= H * src
 * @param {Array<[number, number]>} src - 4 source points [[x0,y0], [x1,y1], [x2,y2], [x3,y3]]
 * @param {Array<[number, number]>} dst - 4 destination points [[u0,v0], [u1,v1], [u2,v2], [u3,v3]]
 * @returns {number[]} 9-element homography matrix in row-major order with H[8] = 1
 */
export function solveHomography(src, dst) {
  if (!src || !dst || src.length < 4 || dst.length < 4) {
    throw new Error('solveHomography requires 4 point correspondences');
  }

  // Construct 8x8 system A * h = b
  // Row 2i:   [x, y, 1, 0, 0, 0, -u*x, -u*y] * h = u
  // Row 2i+1: [0, 0, 0, x, y, 1, -v*x, -v*y] * h = v
  const A = [];
  const b = [];

  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];

    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);

    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col++) {
    // Pivot selection
    let maxRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > maxVal) {
        maxVal = Math.abs(A[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-12) {
      throw new Error('Singular matrix in homography solver: points may be collinear');
    }

    // Swap rows
    if (maxRow !== col) {
      const tempA = A[col];
      A[col] = A[maxRow];
      A[maxRow] = tempA;

      const tempB = b[col];
      b[col] = b[maxRow];
      b[maxRow] = tempB;
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / A[col][col];
      for (let c = col; c < n; c++) {
        A[row][c] -= factor * A[col][c];
      }
      b[row] -= factor * b[col];
    }
  }

  // Back substitution
  const h = new Array(8);
  for (let row = n - 1; row >= 0; row--) {
    let sum = b[row];
    for (let col = row + 1; col < n; col++) {
      sum -= A[row][col] * h[col];
    }
    h[row] = sum / A[row][row];
  }

  // h0..h7 with h8 = 1
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1.0];
}

/**
 * Apply 3x3 homography to 2D point
 * @param {number[]} H - 9-element homography matrix
 * @param {number} x
 * @param {number} y
 * @returns {[number, number]} transformed [x', y']
 */
export function applyH(H, x, y) {
  const w = H[6] * x + H[7] * y + H[8];
  const denom = Math.abs(w) < 1e-12 ? (w >= 0 ? 1e-12 : -1e-12) : w;
  const xPrime = (H[0] * x + H[1] * y + H[2]) / denom;
  const yPrime = (H[3] * x + H[4] * y + H[5]) / denom;
  return [xPrime, yPrime];
}

/**
 * Invert 3x3 homography matrix
 * @param {number[]} H - 9-element array
 * @returns {number[]} 9-element inverse matrix
 */
export function invert3(H) {
  const [a, b, c, d, e, f, g, h, k] = H;

  const A = e * k - f * h;
  const B = -(d * k - f * g);
  const C = d * h - e * g;

  const D = -(b * k - c * h);
  const E = a * k - c * g;
  const F = -(a * h - b * g);

  const G = b * f - c * e;
  const H_ = -(a * f - c * d);
  const K = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-15) {
    throw new Error('Homography matrix is singular and cannot be inverted');
  }

  const invDet = 1.0 / det;
  const inv = [
    A * invDet, D * invDet, G * invDet,
    B * invDet, E * invDet, H_ * invDet,
    C * invDet, F * invDet, K * invDet,
  ];

  return inv;
}

/**
 * Compute reprojection error between ground truth dst and transformed src
 * @param {number[]} H
 * @param {Array<[number, number]>} src
 * @param {Array<[number, number]>} dst
 * @returns {{ rms: number, perPoint: number[] }}
 */
export function reprojectionError(H, src, dst) {
  const perPoint = [];
  let sumSq = 0;

  for (let i = 0; i < src.length; i++) {
    const [tx, ty] = applyH(H, src[i][0], src[i][1]);
    const dx = tx - dst[i][0];
    const dy = ty - dst[i][1];
    const err = Math.sqrt(dx * dx + dy * dy);
    perPoint.push(err);
    sumSq += err * err;
  }

  const rms = Math.sqrt(sumSq / src.length);
  return { rms, perPoint };
}
