import { invert3 } from './homography.js';

/**
 * Weighted quadratic least-squares fit:
 * X(t) = X0 + V0 * (t - tRef) + 0.5 * A * (t - tRef)^2
 */
export function fitQuadratic(ts, xs, weights = null) {
  const n = ts.length;
  if (n < 2) {
    return { X0: xs[0] || 0, V0: 0, A: 0, cov: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], rms: 0, n, tRef: ts[0] || 0 };
  }

  const tRef = ts[0];
  const taus = ts.map((t) => t - tRef);
  const w = weights && weights.length === n ? weights : new Array(n).fill(1.0);

  if (n === 2) {
    // Exact linear fit
    const dt = taus[1] - taus[0];
    const V0 = dt !== 0 ? (xs[1] - xs[0]) / dt : 0;
    return {
      X0: xs[0],
      V0,
      A: 0,
      cov: [
        [0.01, 0, 0],
        [0, 0.5, 0],
        [0, 0, 0],
      ],
      rms: 0,
      n: 2,
      tRef,
    };
  }

  // Construct M = J^T * W * J and r = J^T * W * x
  // Basis: f = [1, tau, 0.5 * tau^2]
  const M = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const r = [0, 0, 0];

  for (let i = 0; i < n; i++) {
    const tau = taus[i];
    const tau2 = tau * tau;
    const f0 = 1;
    const f1 = tau;
    const f2 = 0.5 * tau2;
    const wi = w[i];
    const xi = xs[i];

    M[0][0] += wi * f0 * f0;
    M[0][1] += wi * f0 * f1;
    M[0][2] += wi * f0 * f2;

    M[1][0] += wi * f1 * f0;
    M[1][1] += wi * f1 * f1;
    M[1][2] += wi * f1 * f2;

    M[2][0] += wi * f2 * f0;
    M[2][1] += wi * f2 * f1;
    M[2][2] += wi * f2 * f2;

    r[0] += wi * f0 * xi;
    r[1] += wi * f1 * xi;
    r[2] += wi * f2 * xi;
  }

  // Invert 3x3 matrix M
  let invM;
  try {
    const flatM = [
      M[0][0], M[0][1], M[0][2],
      M[1][0], M[1][1], M[1][2],
      M[2][0], M[2][1], M[2][2],
    ];
    const flatInv = invert3(flatM);
    invM = [
      [flatInv[0], flatInv[1], flatInv[2]],
      [flatInv[3], flatInv[4], flatInv[5]],
      [flatInv[6], flatInv[7], flatInv[8]],
    ];
  } catch {
    // If singular, fallback to linear fit
    const sumT = taus.reduce((a, b) => a + b, 0);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const meanT = sumT / n;
    const meanX = sumX / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (taus[i] - meanT) * (xs[i] - meanX);
      den += (taus[i] - meanT) ** 2;
    }
    const slope = den !== 0 ? num / den : 0;
    return {
      X0: meanX - slope * meanT,
      V0: slope,
      A: 0,
      cov: [[0.01, 0, 0], [0, 0.2, 0], [0, 0, 0]],
      rms: 0.05,
      n,
      tRef,
    };
  }

  // theta = invM * r -> [X0, V0, A]
  const X0 = invM[0][0] * r[0] + invM[0][1] * r[1] + invM[0][2] * r[2];
  const V0 = invM[1][0] * r[0] + invM[1][1] * r[1] + invM[1][2] * r[2];
  const A = invM[2][0] * r[0] + invM[2][1] * r[1] + invM[2][2] * r[2];

  // Residuals and covariance
  let ss = 0;
  let unweightedSs = 0;
  for (let i = 0; i < n; i++) {
    const tau = taus[i];
    const pred = X0 + V0 * tau + 0.5 * A * tau * tau;
    const diff = xs[i] - pred;
    ss += w[i] * diff * diff;
    unweightedSs += diff * diff;
  }

  const df = Math.max(1, n - 3);
  const sigma2 = ss / df;
  const cov = [
    [invM[0][0] * sigma2, invM[0][1] * sigma2, invM[0][2] * sigma2],
    [invM[1][0] * sigma2, invM[1][1] * sigma2, invM[1][2] * sigma2],
    [invM[2][0] * sigma2, invM[2][1] * sigma2, invM[2][2] * sigma2],
  ];

  const rms = Math.sqrt(unweightedSs / n);

  return { X0, V0, A, cov, rms, n, tRef };
}

/**
 * Standard variance of linear speed estimate v(t) = V0 + A * tau
 */
export function varianceOfLinear(cov, tau) {
  // Var(V0 + A*tau) = cov[1][1] + 2*tau*cov[1][2] + tau^2*cov[2][2]
  const v = cov[1][1] + 2 * tau * cov[1][2] + tau * tau * cov[2][2];
  return Math.max(0, v);
}

/**
 * Compute release speed, bounce speed, speed loss, and average speed
 */
export function computeDeliverySpeeds(points, tRelease, tBounce = Infinity) {
  // Pre-bounce points
  const pre = points.filter((p) => p.t >= tRelease && p.t <= tBounce && p.X != null && !isNaN(p.X));
  if (pre.length < 2) {
    return {
      speed: null,
      bounceSpeed: null,
      postBounceSpeed: null,
      lossPct: null,
      avgSpeed: null,
      rms: 0,
      acceleration: 0,
    };
  }

  const ts = pre.map((p) => p.t);
  const xs = pre.map((p) => p.X);
  // Manual fixed points get weight 3, normal detections get 1, interpolated get 0.5
  const weights = pre.map((p) => (p.isManual ? 3.0 : p.interpolated ? 0.5 : 1.0));

  const fit = fitQuadratic(ts, xs, weights);

  const tauRelease = tRelease - fit.tRef;
  const vRelease = fit.V0 + fit.A * tauRelease;
  const sdRelease = Math.sqrt(varianceOfLinear(fit.cov, tauRelease));

  const speed = {
    mps: Math.abs(vRelease),
    kmh: Math.abs(vRelease) * 3.6,
    mph: Math.abs(vRelease) * 2.23694,
    sd: sdRelease,
  };

  // Speed at bounce
  let bounceSpeed = null;
  let lossPct = null;
  if (tBounce < Infinity && tBounce >= tRelease) {
    const tauBounce = tBounce - fit.tRef;
    const vBounce = fit.V0 + fit.A * tauBounce;
    const sdBounce = Math.sqrt(varianceOfLinear(fit.cov, tauBounce));
    bounceSpeed = {
      mps: Math.abs(vBounce),
      kmh: Math.abs(vBounce) * 3.6,
      mph: Math.abs(vBounce) * 2.23694,
      sd: sdBounce,
    };

    if (speed.mps > 0) {
      lossPct = Math.max(0, ((speed.mps - bounceSpeed.mps) / speed.mps) * 100);
    }
  }

  // Speed after bounce (linear fit over post-bounce points if >= 4 points)
  let postBounceSpeed = null;
  const post = points.filter((p) => p.t > tBounce && p.X != null && !isNaN(p.X));
  if (post.length >= 4) {
    const postTs = post.map((p) => p.t);
    const postXs = post.map((p) => p.X);
    const postWeights = post.map((p) => (p.isManual ? 3.0 : p.interpolated ? 0.5 : 1.0));
    const postFit = fitQuadratic(postTs, postXs, postWeights);
    const postV = Math.abs(postFit.V0);
    postBounceSpeed = {
      mps: postV,
      kmh: postV * 3.6,
      mph: postV * 2.23694,
      sd: Math.sqrt(postFit.cov[1][1]),
    };

    if (lossPct === null && speed.mps > 0) {
      lossPct = Math.max(0, ((speed.mps - postV) / speed.mps) * 100);
    }
  }

  // Average speed from release to crossing/end
  const lastPt = points[points.length - 1];
  const firstPt = pre[0];
  const dtTotal = lastPt.t - firstPt.t;
  const dxTotal = (lastPt.X || 0) - (firstPt.X || 0);
  const avgMps = dtTotal > 0 ? Math.abs(dxTotal / dtTotal) : speed.mps;
  const avgSpeed = {
    mps: avgMps,
    kmh: avgMps * 3.6,
    mph: avgMps * 2.23694,
  };

  return {
    speed,
    bounceSpeed,
    postBounceSpeed,
    lossPct,
    avgSpeed,
    rms: fit.rms,
    acceleration: fit.A,
    fit,
  };
}

/**
 * Assess quality grade (A, B, C, D)
 */
export function computeQualityGrade({ fps, pointCount, rms, hasDroppedFrames = false, mode = 'sideOn', calibRmsCm = 0 }) {
  const reasons = [];

  if (mode === 'behindArm') {
    reasons.push('Behind-the-arm mode: planar speed is approximate');
    return { grade: 'C', reasons, label: 'Approximate' };
  }

  if (calibRmsCm > 5.0) {
    reasons.push(`Calibration error ${calibRmsCm.toFixed(1)} cm exceeds 5 cm`);
  }
  if (hasDroppedFrames) {
    reasons.push('Dropped frames detected in video presentation');
  }

  // Grade A: fps >= 200, >= 18 points, RMS < 0.05m, no dropped frames
  if (fps >= 195 && pointCount >= 18 && rms < 0.05 && !hasDroppedFrames && calibRmsCm <= 5.0) {
    return { grade: 'A', reasons: ['High frame rate and sub-centimeter fit'], label: 'High Precision' };
  }

  // Grade B: fps >= 100, >= 12 points, RMS < 0.10m
  if (fps >= 95 && pointCount >= 12 && rms < 0.10 && calibRmsCm <= 8.0) {
    if (fps < 200) reasons.push(`Frame rate is ${Math.round(fps)} fps (need 200+ for Grade A)`);
    if (pointCount < 18) reasons.push(`${pointCount} tracked points (need 18+ for Grade A)`);
    if (rms >= 0.05) reasons.push(`Fit residual ${(rms * 100).toFixed(1)} cm (need < 5 cm for Grade A)`);
    return { grade: 'B', reasons, label: 'Good' };
  }

  // Grade C: fps >= 50, >= 8 points, RMS < 0.20m
  if (fps >= 48 && pointCount >= 8 && rms < 0.20) {
    if (fps < 100) reasons.push(`Frame rate is ${Math.round(fps)} fps (need 100+ for Grade B)`);
    if (pointCount < 12) reasons.push(`${pointCount} tracked points (need 12+ for Grade B)`);
    if (rms >= 0.10) reasons.push(`Fit residual ${(rms * 100).toFixed(1)} cm (need < 10 cm for Grade B)`);
    return { grade: 'C', reasons, label: 'Fair' };
  }

  // Grade D
  if (fps < 50) reasons.push(`Low frame rate (${Math.round(fps)} fps, 1.3 m/frame)`);
  if (pointCount < 8) reasons.push(`Only ${pointCount} points tracked`);
  if (rms >= 0.20) reasons.push(`High trajectory residual ${(rms * 100).toFixed(1)} cm`);
  return { grade: 'D', reasons, label: 'Indicative only' };
}
