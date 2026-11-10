export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface LinearRegressionResult {
  slope: number; // m in y = m*x + c
  intercept: number; // c
  r2: number;
  stdErr: number;
}

/**
 * Standard ordinary least squares regression of y on x
 */
export function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = x.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0, stdErr: 0 };
  }

  const xMean = mean(x);
  const yMean = mean(y);

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  if (Math.abs(ssXX) < 1e-9) {
    return { slope: 0, intercept: yMean, r2: 0, stdErr: 0 };
  }

  const slope = ssXY / ssXX;
  const intercept = yMean - slope * xMean;

  // Compute residuals and R²
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * x[i] + intercept;
    const res = y[i] - pred;
    ssRes += res * res;
  }

  const r2 = ssYY > 1e-9 ? Math.max(0, 1 - ssRes / ssYY) : 1;
  const stdErr = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  return { slope, intercept, r2, stdErr };
}
