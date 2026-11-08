import { PITCH } from '../data/landmarks.js';
import { calibratePitch } from './calibration.js';
import { ClassicalBallDetector } from './detect.js';
import { applyH } from './homography.js';
import { computeDeliverySpeeds } from './speed.js';
import { BallTracker } from './track.js';

/**
 * Known reference camera setup for side-on view (1280x720)
 * Bowler stumps at ~120px, Striker stumps at ~1160px
 */
export const SYNTH_CAMERA = {
  width: 1280,
  height: 720,
  // 4 landmarks: [bowler base, bowler top, striker base, striker top]
  imagePoints: [
    [140, 560], // (0, 0)
    [140, 480], // (0, 0.711) - 80px stump
    [1140, 560], // (20.12, 0)
    [1140, 480], // (20.12, 0.711)
  ],
};

export function getSynthCalibration() {
  return calibratePitch('sideOn', SYNTH_CAMERA.imagePoints, SYNTH_CAMERA.width, SYNTH_CAMERA.height);
}

/**
 * Generate synthetic physics flight points for a delivery
 */
export function generateSyntheticTrajectory(options = {}) {
  const {
    v0 = 36.11, // ~130 km/h (m/s)
    fps = 120,
    bounceDist = 14.5, // m from bowler stumps
    dt = 1 / fps,
  } = options;

  const points = [];
  let t = 0;
  let X = 1.0; // 1m past bowler stumps
  let Z = 2.1; // 2.1m release height

  // Angle aimed to bounce at bounceDist
  const totalXToBounce = bounceDist - X;
  const tToBounceApprox = totalXToBounce / v0;
  // Z = Z0 + Vz0*t - 0.5*g*t^2 = 0.036 => Vz0 = (0.036 - Z0 + 0.5*g*t^2) / t
  const vz0 = (PITCH.ballRadius - Z + 0.5 * 9.81 * (tToBounceApprox ** 2)) / tToBounceApprox;
  const vx0 = Math.sqrt(Math.max(10, v0 * v0 - vz0 * vz0));

  let Vx = vx0;
  let Vz = vz0;
  let hasBounced = false;

  const calib = getSynthCalibration();
  let bounceT = null;

  while (X <= 21.5 && t < 1.5) {
    // Project to image pixels
    const [px, py] = applyH(calib.invH, X, Z);

    // Add mild Gaussian-like noise (+-0.5 px)
    const noiseX = (Math.random() - 0.5) * 1.0;
    const noiseY = (Math.random() - 0.5) * 1.0;

    points.push({
      t,
      X,
      Z,
      x: px + noiseX,
      y: py + noiseY,
      r: 6.5,
      score: 0.92,
      interpolated: false,
      isManual: false,
    });

    // Euler/Verlet integration
    // Drag deceleration: 0.4 m/s^2 per m/s relative to v0
    const dragCoeff = 0.003;
    const speed = Math.sqrt(Vx * Vx + Vz * Vz);
    const ax = -dragCoeff * speed * Vx;
    const az = -9.81 - dragCoeff * speed * Vz;

    X += Vx * dt + 0.5 * ax * dt * dt;
    Z += Vz * dt + 0.5 * az * dt * dt;
    Vx += ax * dt;
    Vz += az * dt;
    t += dt;

    // Check bounce
    if (Z <= PITCH.ballRadius && !hasBounced) {
      hasBounced = true;
      bounceT = t;
      Z = PITCH.ballRadius;
      // Restitution 0.55, horizontal friction loss 12%
      Vz = -Vz * 0.55;
      Vx = Vx * 0.88;
    }
  }

  return { points, trueV0: v0, trueBounceDist: bounceDist, bounceT, calib };
}

/**
 * Render synthetic delivery into canvas frames and run through end-to-end pipeline
 */
export async function runSyntheticTest(v0Mps, fps) {
  const { points: trueTrajectory, trueV0, calib } = generateSyntheticTrajectory({ v0: v0Mps, fps });

  // Feed simulated detections through Tracker and Speed estimator
  const tracker = new BallTracker({ calibration: calib });

  for (let i = 0; i < trueTrajectory.length; i++) {
    const pt = trueTrajectory[i];
    // Candidate in current frame
    const cand = [{
      t: pt.t,
      x: pt.x,
      y: pt.y,
      r: pt.r,
      score: 0.9,
    }];
    tracker.processFrame(cand, pt.t);
  }

  const { rawPoints } = tracker.finalize();

  // Convert rawPoints to metric X, Z
  const metricPoints = rawPoints.map((p) => {
    const [X, Z] = applyH(calib.H, p.x, p.y);
    return { ...p, X, Z };
  });

  const speedResult = computeDeliverySpeeds(metricPoints, trueTrajectory[0].t);
  const measuredV0Mps = speedResult.speed?.mps || 0;
  const measuredKmh = measuredV0Mps * 3.6;
  const trueKmh = trueV0 * 3.6;
  const errorKmh = Math.abs(measuredKmh - trueKmh);

  return {
    fps,
    trueV0Mps: v0Mps,
    trueKmh,
    measuredKmh,
    errorKmh,
    pointCount: rawPoints.length,
    passed:
      (fps >= 240 && errorKmh <= 2.0) ||
      (fps >= 120 && errorKmh <= 3.0) ||
      (fps <= 60 && errorKmh <= 6.0),
  };
}
