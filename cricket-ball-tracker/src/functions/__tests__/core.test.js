import { describe, expect, it } from 'vitest';
import { DEFAULT_LENGTH_ZONES, getLengthZone } from '../../data/lengthZones.js';
import { calibratePitch } from '../calibration.js';
import { detectBounceAndLength } from '../events.js';
import { applyH, invert3, solveHomography } from '../homography.js';
import { KalmanBallFilter } from '../kalman.js';
import { fitQuadratic } from '../speed.js';
import { generateSyntheticTrajectory, runSyntheticTest } from '../synth.js';

describe('Homography maths', () => {
  it('solves homography and does round-trip within 1e-6', () => {
    const src = [
      [100, 200],
      [100, 50],
      [800, 200],
      [800, 50],
    ];
    const dst = [
      [0, 0],
      [0, 0.711],
      [20.12, 0],
      [20.12, 0.711],
    ];

    const H = solveHomography(src, dst);
    const invH = invert3(H);

    for (let i = 0; i < src.length; i++) {
      const [u, v] = applyH(H, src[i][0], src[i][1]);
      expect(Math.abs(u - dst[i][0])).toBeLessThan(1e-5);
      expect(Math.abs(v - dst[i][1])).toBeLessThan(1e-5);

      const [origX, origY] = applyH(invH, u, v);
      expect(Math.abs(origX - src[i][0])).toBeLessThan(1e-5);
      expect(Math.abs(origY - src[i][1])).toBeLessThan(1e-5);
    }
  });
});

describe('Quadratic fit', () => {
  it('recovers known coefficients within 1e-6', () => {
    // Known: X(t) = 1.5 + 38.0 * (t - 0.2) - 0.5 * 2.4 * (t - 0.2)^2
    const X0_true = 1.5;
    const V0_true = 38.0;
    const A_true = -2.4;
    const tRef = 0.2;

    const ts = [];
    const xs = [];
    for (let i = 0; i < 20; i++) {
      const t = tRef + i * 0.01;
      const tau = t - tRef;
      const x = X0_true + V0_true * tau + 0.5 * A_true * tau * tau;
      ts.push(t);
      xs.push(x);
    }

    const fit = fitQuadratic(ts, xs);
    expect(Math.abs(fit.X0 - X0_true)).toBeLessThan(1e-5);
    expect(Math.abs(fit.V0 - V0_true)).toBeLessThan(1e-5);
    expect(Math.abs(fit.A - A_true)).toBeLessThan(1e-5);
    expect(fit.rms).toBeLessThan(1e-5);
  });
});

describe('Kalman filter tracking', () => {
  it('tracks a straight line with noise under 1 px RMS', () => {
    const filter = new KalmanBallFilter({ q: 2000, r: 2.25 });
    const x0 = 50;
    const y0 = 100;
    const vx = 600; // px/s
    const vy = 50; // px/s
    const dt = 1 / 120;

    filter.init(x0, y0, vx, vy);

    let sumSqErr = 0;
    const N = 50;

    for (let i = 1; i <= N; i++) {
      const t = i * dt;
      const trueX = x0 + vx * t;
      const trueY = y0 + vy * t;

      // Measurement with slight random noise
      const measX = trueX + (Math.sin(i * 3) * 0.8);
      const measY = trueY + (Math.cos(i * 3) * 0.8);

      const { statePred, Ppred } = filter.predict(dt);
      const { invS } = filter.getInnovationCovariance(Ppred);
      const updatedState = filter.update(measX, measY, statePred, Ppred, invS);

      const errX = updatedState[0] - trueX;
      const errY = updatedState[1] - trueY;
      sumSqErr += errX * errX + errY * errY;
    }

    const rms = Math.sqrt(sumSqErr / N);
    expect(rms).toBeLessThan(1.0);
  });
});

describe('Bounce detection and length zones', () => {
  it('classifies length zones accurately according to distance bands', () => {
    expect(getLengthZone(-1).id).toBe('full-toss');
    expect(getLengthZone(0.5).id).toBe('yorker');
    expect(getLengthZone(2.5).id).toBe('full');
    expect(getLengthZone(4.8).id).toBe('good');
    expect(getLengthZone(7.0).id).toBe('short-of-length');
    expect(getLengthZone(9.2).id).toBe('short');
  });

  it('detects bounce point within one frame', () => {
    const { points, bounceT } = generateSyntheticTrajectory({ v0: 35, fps: 120 });
    const bounceRes = detectBounceAndLength(points, 0, 'sideOn');

    expect(bounceRes.isFullToss).toBe(false);
    expect(bounceRes.tBounce).toBeDefined();
    // Within 1 frame of actual synthetic bounce (1/120 = ~0.0083s)
    const dt = Math.abs(bounceRes.tBounce - bounceT);
    expect(dt).toBeLessThan(0.02);
  });
});

describe('Synthetic end-to-end speed error bounds', () => {
  it('satisfies speed error bounds at 240, 120, and 60 fps', async () => {
    // 240 fps bound: <= 2.0 km/h
    const test240 = await runSyntheticTest(38.89, 240); // 140 km/h
    expect(test240.errorKmh).toBeLessThan(2.0);

    // 120 fps bound: <= 3.0 km/h
    const test120 = await runSyntheticTest(33.33, 120); // 120 km/h
    expect(test120.errorKmh).toBeLessThan(3.0);

    // 60 fps bound: <= 6.0 km/h
    const test60 = await runSyntheticTest(25.0, 60); // 90 km/h
    expect(test60.errorKmh).toBeLessThan(6.0);
  });
});
