import { PITCH } from '../data/landmarks.js';
import { getLengthZone } from '../data/lengthZones.js';
import { fitQuadratic } from './speed.js';

/**
 * Detect ball release frame & timestamp
 * Earliest detection where speed exceeds 60% median speed and X >= 0
 */
export function detectRelease(points) {
  if (!points || points.length < 2) return points?.[0]?.t || 0;

  // Calculate speeds between consecutive points
  const speeds = [];
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t;
    if (dt > 0 && points[i].X != null && points[i - 1].X != null) {
      const dX = points[i].X - points[i - 1].X;
      speeds.push(Math.abs(dX / dt));
    }
  }

  if (speeds.length === 0) return points[0].t;

  const sorted = [...speeds].sort((a, b) => a - b);
  const medianSpeed = sorted[Math.floor(sorted.length / 2)] || 25;
  const speedThreshold = 0.6 * medianSpeed;

  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t;
    if (dt > 0 && points[i].X != null && points[i - 1].X != null) {
      const spd = Math.abs((points[i].X - points[i - 1].X) / dt);
      if (spd >= speedThreshold && points[i].X >= -0.5) {
        return points[i - 1].t;
      }
    }
  }

  return points[0].t;
}

/**
 * Detect bounce point, length, bounce height, and trajectory at stumps (side-on)
 */
export function detectBounceAndLength(points, tRelease, mode = 'sideOn') {
  if (!points || points.length < 3) {
    return {
      tBounce: null,
      xBounce: null,
      lengthDist: null,
      lengthZone: getLengthZone(null),
      bounceHeight: null,
      isFullToss: true,
      stumpsCrossingZ: null,
      isHittingStumps: false,
    };
  }

  // Consider points after release and before stumps + 2m
  const valid = points.filter((p) => p.t >= tRelease && p.X != null && p.X <= 22.12);
  if (valid.length < 3) {
    return {
      tBounce: null,
      xBounce: null,
      lengthDist: null,
      lengthZone: getLengthZone(null),
      bounceHeight: null,
      isFullToss: true,
      stumpsCrossingZ: null,
      isHittingStumps: false,
    };
  }

  if (mode === 'behindArm') {
    // In behind-arm mode, estimate bounce from ground intersection / sharp change in velocity
    // For now, take point at 60-70% distance if available
    return {
      tBounce: null,
      xBounce: null,
      lengthDist: null,
      lengthZone: { id: 'approx', name: 'Behind-arm (Planar)', color: '#ffb020' },
      bounceHeight: null,
      isFullToss: false,
      stumpsCrossingZ: null,
      isHittingStumps: false,
    };
  }

  // Side-on: examine Z(t) minimum
  let minZ = Infinity;
  let minIdx = -1;

  for (let i = 0; i < valid.length; i++) {
    const z = valid[i].Z != null ? valid[i].Z : 1.0;
    if (z < minZ) {
      minZ = z;
      minIdx = i;
    }
  }

  // If minZ never goes below 0.50 m or happens at the very end past the stumps, classify as full toss
  const minPt = valid[minIdx];
  if (minZ > 0.45 || (minPt && minPt.X > PITCH.stumpToStump)) {
    // Project height at stumps
    const stumpsCrossingZ = extrapolateZAtX(valid, PITCH.stumpToStump);
    const isHitting = stumpsCrossingZ >= 0 && stumpsCrossingZ <= PITCH.stumpHeight;

    return {
      tBounce: null,
      xBounce: null,
      lengthDist: null,
      lengthZone: getLengthZone(-1), // Full toss
      bounceHeight: null,
      isFullToss: true,
      stumpsCrossingZ,
      isHittingStumps: isHitting,
    };
  }

  // Fit quadratic to pre-bounce Z(t)
  const preBounceZ = valid.slice(0, Math.max(minIdx + 1, 2));
  let tBounce = minPt.t;
  let xBounce = minPt.X;

  if (preBounceZ.length >= 3) {
    const ts = preBounceZ.map((p) => p.t);
    const zs = preBounceZ.map((p) => p.Z);
    const fitZ = fitQuadratic(ts, zs);

    // Solve for Z = ballRadius = 0.036
    // 0.5 * A * tau^2 + V0 * tau + (X0 - 0.036) = 0
    const a = 0.5 * fitZ.A;
    const b = fitZ.V0;
    const c = fitZ.X0 - PITCH.ballRadius;

    const disc = b * b - 4 * a * c;
    if (disc >= 0 && Math.abs(a) > 1e-5) {
      const tau1 = (-b - Math.sqrt(disc)) / (2 * a);
      const tau2 = (-b + Math.sqrt(disc)) / (2 * a);
      const candTau = [tau1, tau2].filter((tau) => tau >= 0 && tau <= 1.5);
      if (candTau.length > 0) {
        const bestTau = candTau.reduce((prev, curr) =>
          Math.abs(curr - (minPt.t - fitZ.tRef)) < Math.abs(prev - (minPt.t - fitZ.tRef)) ? curr : prev
        );
        tBounce = fitZ.tRef + bestTau;
      }
    }
  }

  // Interpolate xBounce at tBounce
  xBounce = interpolateXAtT(valid, tBounce);

  // Length distance from striker-end stumps: 20.12 - xBounce
  const lengthDist = Math.max(0, PITCH.stumpToStump - xBounce);
  const lengthZone = getLengthZone(lengthDist);

  // Bounce height: maximum Z in post-bounce within 0.35s
  let maxZPost = minZ;
  for (let i = minIdx; i < valid.length; i++) {
    const p = valid[i];
    if (p.t >= tBounce && p.t <= tBounce + 0.35) {
      if (p.Z > maxZPost) {
        maxZPost = p.Z;
      }
    }
  }
  const bounceHeight = Math.max(0.1, maxZPost);

  // Project crossing at stumps
  const postBouncePoints = valid.slice(minIdx);
  const stumpsCrossingZ = postBouncePoints.length >= 2
    ? extrapolateZAtX(postBouncePoints, PITCH.stumpToStump)
    : extrapolateZAtX(valid, PITCH.stumpToStump);

  const isHittingStumps = stumpsCrossingZ != null && stumpsCrossingZ >= 0 && stumpsCrossingZ <= PITCH.stumpHeight;

  return {
    tBounce,
    xBounce,
    lengthDist,
    lengthZone,
    bounceHeight,
    isFullToss: false,
    stumpsCrossingZ,
    isHittingStumps,
  };
}

/**
 * Extrapolate ball height Z at specified along-pitch X
 */
function extrapolateZAtX(points, targetX) {
  if (!points || points.length === 0) return 0.5;
  if (points.length === 1) return points[0].Z || 0.5;

  // Find two surrounding points or use last two
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    if (p1.X <= targetX && p2.X >= targetX && p2.X !== p1.X) {
      const frac = (targetX - p1.X) / (p2.X - p1.X);
      return p1.Z + frac * (p2.Z - p1.Z);
    }
  }

  // Linear extrapolation using last two points
  const p1 = points[points.length - 2];
  const p2 = points[points.length - 1];
  const dX = p2.X - p1.X;
  if (Math.abs(dX) < 1e-4) return p2.Z;
  const slope = (p2.Z - p1.Z) / dX;
  return p2.Z + slope * (targetX - p2.X);
}

function interpolateXAtT(points, targetT) {
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    if (p1.t <= targetT && p2.t >= targetT && p2.t !== p1.t) {
      const frac = (targetT - p1.t) / (p2.t - p1.t);
      return p1.X + frac * (p2.X - p1.X);
    }
  }
  return points[points.length - 1].X;
}

/**
 * Swing and deviation (behind-arm mode)
 */
export function detectSwingAndDeviation(points, tRelease, tBounce = Infinity) {
  const pre = points.filter((p) => p.t >= tRelease && p.t <= tBounce && p.Y != null);
  if (pre.length < 3) return { swing: 0, turn: 0 };

  // Reference straight line from release to first 25% of flight
  const quarterIdx = Math.max(1, Math.floor(pre.length * 0.25));
  const p0 = pre[0];
  const pQuarter = pre[quarterIdx];

  const dXRef = pQuarter.X - p0.X;
  const dYRef = pQuarter.Y - p0.Y;
  const slope = Math.abs(dXRef) > 1e-4 ? dYRef / dXRef : 0;

  let maxDeviation = 0;
  for (let i = quarterIdx; i < pre.length; i++) {
    const expectedY = p0.Y + slope * (pre[i].X - p0.X);
    const dev = Math.abs(pre[i].Y - expectedY);
    if (dev > maxDeviation) {
      maxDeviation = dev;
    }
  }

  // Turn: change in lateral direction across the bounce (degrees)
  let turnDeg = 0;
  const post = points.filter((p) => p.t > tBounce && p.Y != null);
  if (pre.length >= 2 && post.length >= 2) {
    const preV = (pre[pre.length - 1].Y - pre[0].Y) / Math.max(0.01, pre[pre.length - 1].X - pre[0].X);
    const postV = (post[post.length - 1].Y - post[0].Y) / Math.max(0.01, post[post.length - 1].X - post[0].X);
    const anglePre = Math.atan(preV) * (180 / Math.PI);
    const anglePost = Math.atan(postV) * (180 / Math.PI);
    turnDeg = anglePost - anglePre;
  }

  return {
    swing: maxDeviation, // metres
    turn: turnDeg, // degrees
  };
}
