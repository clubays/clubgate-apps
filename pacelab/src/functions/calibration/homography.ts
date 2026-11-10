import { Point2D } from '@/types';

/**
 * Solves 3x3 homography matrix H using Direct Linear Transform (DLT)
 * with 8x8 Gaussian elimination with partial pivoting.
 * Maps points from srcPoints -> dstPoints.
 * srcPoints: 4 points in image coordinates
 * dstPoints: 4 points in real-world metric coordinates
 * Returns row-major array of length 9: [h11, h12, h13, h21, h22, h23, h31, h32, h33]
 */
export function solveHomography(srcPoints: Point2D[], dstPoints: Point2D[]): number[] {
  if (srcPoints.length !== 4 || dstPoints.length !== 4) {
    throw new Error('solveHomography requires exactly 4 point correspondences.');
  }

  // Set up 8x8 linear system A * h = b (assuming h33 = 1)
  const A: number[][] = Array.from({ length: 8 }, () => new Array(8).fill(0));
  const b: number[] = new Array(8).fill(0);

  for (let i = 0; i < 4; i++) {
    const x = srcPoints[i].x;
    const y = srcPoints[i].y;
    const u = dstPoints[i].x;
    const v = dstPoints[i].y;

    const row1 = 2 * i;
    const row2 = 2 * i + 1;

    // Row 1: x*h11 + y*h12 + h13 - x*u*h31 - y*u*h32 = u
    A[row1][0] = x;
    A[row1][1] = y;
    A[row1][2] = 1;
    A[row1][3] = 0;
    A[row1][4] = 0;
    A[row1][5] = 0;
    A[row1][6] = -x * u;
    A[row1][7] = -y * u;
    b[row1] = u;

    // Row 2: x*h21 + y*h22 + h23 - x*v*h31 - y*v*h32 = v
    A[row2][0] = 0;
    A[row2][1] = 0;
    A[row2][2] = 0;
    A[row2][3] = x;
    A[row2][4] = y;
    A[row2][5] = 1;
    A[row2][6] = -x * v;
    A[row2][7] = -y * v;
    b[row2] = v;
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col++) {
    // Find pivot row
    let maxRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > maxVal) {
        maxVal = Math.abs(A[r][col]);
        maxRow = r;
      }
    }

    if (maxVal < 1e-12) {
      throw new Error('Singular matrix in homography solver. Points may be collinear.');
    }

    // Swap pivot row
    if (maxRow !== col) {
      const tempRow = A[col];
      A[col] = A[maxRow];
      A[maxRow] = tempRow;

      const tempB = b[col];
      b[col] = b[maxRow];
      b[maxRow] = tempB;
    }

    // Eliminate below
    for (let r = col + 1; r < n; r++) {
      const factor = A[r][col] / A[col][col];
      for (let c = col; c < n; c++) {
        A[r][c] -= factor * A[col][c];
      }
      b[r] -= factor * b[col];
    }
  }

  // Back substitution
  const h = new Array(8).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = b[r];
    for (let c = r + 1; c < n; c++) {
      sum -= A[r][c] * h[c];
    }
    h[r] = sum / A[r][r];
  }

  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1.0];
}

/**
 * Applies homography matrix H (length 9) to a 2D point
 */
export function applyHomography(H: number[], p: Point2D): Point2D {
  const denom = H[6] * p.x + H[7] * p.y + H[8];
  if (Math.abs(denom) < 1e-9) {
    return { x: 0, y: 0 };
  }
  return {
    x: (H[0] * p.x + H[1] * p.y + H[2]) / denom,
    y: (H[3] * p.x + H[4] * p.y + H[5]) / denom,
  };
}

/**
 * Computes inverse of 3x3 homography matrix H
 */
export function invertHomography(H: number[]): number[] {
  const [
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22
  ] = H;

  // Minors and cofactors
  const c00 = m11 * m22 - m12 * m21;
  const c01 = -(m10 * m22 - m12 * m20);
  const c02 = m10 * m21 - m11 * m20;

  const c10 = -(m01 * m22 - m02 * m21);
  const c11 = m00 * m22 - m02 * m20;
  const c12 = -(m00 * m21 - m01 * m20);

  const c20 = m01 * m12 - m02 * m11;
  const c21 = -(m00 * m12 - m02 * m10);
  const c22 = m00 * m11 - m01 * m10;

  const det = m00 * c00 + m01 * c01 + m02 * c02;
  if (Math.abs(det) < 1e-12) {
    throw new Error('Singular homography matrix cannot be inverted.');
  }

  const invDet = 1.0 / det;

  // Transpose of cofactor matrix divided by det
  return [
    c00 * invDet, c10 * invDet, c20 * invDet,
    c01 * invDet, c11 * invDet, c21 * invDet,
    c02 * invDet, c12 * invDet, c22 * invDet,
  ];
}
