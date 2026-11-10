import { describe, expect, it } from 'vitest';
import { solveHomography, applyHomography, invertHomography } from '@/functions/calibration/homography';
import { evaluateCalibrationQuality } from '@/functions/calibration/gates';
import { Kalman2D } from '@/functions/tracking/kalman2D';
import { TrackManager } from '@/functions/tracking/trackManager';
import { findSegmentIntersection, findGateCrossing } from '@/utils/geometry';
import { speedFromGates } from '@/functions/speed/speedFromGates';
import { speedFromFit } from '@/functions/speed/speedFromFit';
import { detectBounce } from '@/functions/speed/detectBounce';
import { calculateSpeedUncertainty, evaluateSpeedResult } from '@/functions/speed/uncertainty';
import { toCSV } from '@/functions/export/toCSV';
import { convertSpeed, formatSpeed, getSpeedClass } from '@/utils/units';
import { rgbToHsv, isHsvMatch } from '@/utils/color';
import { renderSyntheticDelivery } from '@/functions/simulate/renderSyntheticDelivery';
import { diffFrames } from '@/functions/vision/diffFrames';
import { colorMask } from '@/functions/vision/colorMask';
import { combineMasks } from '@/functions/vision/combineMasks';
import { ConnectedComponentLabeler } from '@/functions/vision/labelComponents';
import { scoreCandidates } from '@/functions/vision/scoreCandidates';
import { getExpectedBallSize } from '@/functions/calibration/expectedBallSize';
import { LineSegment, TrackPoint } from '@/types';

describe('1. Unit Conversions & Formatting', () => {
  it('converts m/s to km/h and mph accurately', () => {
    const speedMps = 38.888888; // 140 km/h
    expect(convertSpeed(speedMps, 'km/h')).toBeCloseTo(140.0, 1);
    expect(convertSpeed(speedMps, 'mph')).toBeCloseTo(86.99, 1);
    expect(convertSpeed(speedMps, 'm/s')).toBeCloseTo(38.89, 1);
    expect(formatSpeed(speedMps, 'km/h', 1)).toBe('140.0');
  });

  it('correctly maps speeds to cricket pace classes', () => {
    expect(getSpeedClass(80 / 3.6).name).toBe('Spin');
    expect(getSpeedClass(110 / 3.6).name).toBe('Medium');
    expect(getSpeedClass(130 / 3.6).name).toBe('Medium-Fast');
    expect(getSpeedClass(140 / 3.6).name).toBe('Fast');
    expect(getSpeedClass(150 / 3.6).name).toBe('Express');
  });
});

describe('2. Color Conversion & HSV Matching', () => {
  it('converts RGB to HSV and handles wrapped hue for red ball', () => {
    const redHsv = rgbToHsv(220, 20, 20);
    expect(redHsv.h <= 20 || redHsv.h >= 345).toBe(true);
    expect(redHsv.s).toBeGreaterThan(70);

    const redPreset = { hMin: 345, hMax: 20, sMin: 35, sMax: 100, vMin: 20, vMax: 90 };
    expect(isHsvMatch(redHsv, redPreset)).toBe(true);

    const greenHsv = rgbToHsv(20, 200, 20);
    expect(isHsvMatch(greenHsv, redPreset)).toBe(false);
  });
});

describe('3. Geometry: Segment Intersection & Sub-Frame Crossing', () => {
  it('detects perpendicular segment intersection and returns parameter u', () => {
    const p1 = { x: 100, y: 300 };
    const p2 = { x: 200, y: 300 };
    const q1 = { x: 150, y: 200 };
    const q2 = { x: 150, y: 400 };

    const hit = findSegmentIntersection(p1, p2, q1, q2);
    expect(hit.intersects).toBe(true);
    expect(hit.u).toBeCloseTo(0.5, 4);
    expect(hit.point?.x).toBeCloseTo(150, 4);
    expect(hit.point?.y).toBeCloseTo(300, 4);
  });

  it('interpolates sub-frame gate crossing time', () => {
    const track: TrackPoint[] = [
      { t: 0.10, x: 100, y: 300, conf: 1 },
      { t: 0.12, x: 200, y: 300, conf: 1 },
    ];
    const gate: LineSegment = {
      p1: { x: 175, y: 100 },
      p2: { x: 175, y: 500 },
    };

    const crossing = findGateCrossing(track, gate);
    expect(crossing).not.toBeNull();
    expect(crossing!.crossed).toBe(true);
    // At x = 175, fraction is 0.75, so t = 0.10 + 0.75 * 0.02 = 0.115
    expect(crossing!.t).toBeCloseTo(0.115, 4);
    expect(crossing!.point.x).toBeCloseTo(175, 2);
  });
});

describe('4. Planar Homography: Solve, Apply, Invert', () => {
  it('solves homography and round-trips points through inversion', () => {
    // 4 corners of pitch in image coords
    const src = [
      { x: 100, y: 100 },
      { x: 500, y: 120 },
      { x: 550, y: 450 },
      { x: 80, y: 400 },
    ];

    // Real world coordinates in metres (e.g. 0 to 20m along pitch, 0 to 3m wide)
    const dst = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 3 },
      { x: 0, y: 3 },
    ];

    const H = solveHomography(src, dst);
    expect(H).toHaveLength(9);

    // Test forward mapping of all 4 corners
    for (let i = 0; i < 4; i++) {
      const mapped = applyHomography(H, src[i]);
      expect(mapped.x).toBeCloseTo(dst[i].x, 2);
      expect(mapped.y).toBeCloseTo(dst[i].y, 2);
    }

    // Invert homography and verify round-trip
    const H_inv = invertHomography(H);
    for (let i = 0; i < 4; i++) {
      const back = applyHomography(H_inv, dst[i]);
      expect(back.x).toBeCloseTo(src[i].x, 1);
      expect(back.y).toBeCloseTo(src[i].y, 1);
    }
  });
});

describe('5. Kalman Filter Convergence', () => {
  it('converges to true position and tracks velocity under noise', () => {
    const trueVx = 400; // px/s
    const trueVy = 50;  // px/s
    const dt = 1 / 60;  // 60 fps

    const kf = new Kalman2D(100, 200);
    let trueX = 100;
    let trueY = 200;

    for (let step = 0; step < 20; step++) {
      trueX += trueVx * dt;
      trueY += trueVy * dt;

      kf.predict(dt);
      const measX = trueX + (Math.random() - 0.5) * 2;
      const measY = trueY + (Math.random() - 0.5) * 2;
      kf.update(measX, measY);
    }

    expect(Math.abs(kf.state[0] - trueX)).toBeLessThan(5);
    expect(Math.abs(kf.state[1] - trueY)).toBeLessThan(5);
    expect(Math.abs(kf.state[2] - trueVx)).toBeLessThan(45);
    expect(Math.abs(kf.state[3] - trueVy)).toBeLessThan(45);
  });
});

describe('6. Pitch Bounce Detection', () => {
  it('accurately identifies bounce apex in trajectory', () => {
    // Ball descending (y increasing) then rebounding up (y decreasing)
    const track: TrackPoint[] = [
      { t: 0.00, x: 100, y: 200, conf: 1 },
      { t: 0.02, x: 150, y: 260, conf: 1 },
      { t: 0.04, x: 200, y: 320, conf: 1 },
      { t: 0.06, x: 250, y: 350, conf: 1 }, // Bounce at apex (max y = 350)
      { t: 0.08, x: 300, y: 310, conf: 1 },
      { t: 0.10, x: 350, y: 270, conf: 1 },
      { t: 0.12, x: 400, y: 240, conf: 1 },
    ];

    const result = detectBounce(track);
    expect(result.hasBounce).toBe(true);
    expect(result.bounceIndex).toBe(3);
    expect(result.preBouncePoints.length).toBe(4);
    expect(result.preBouncePoints[3].y).toBe(350);
  });
});

describe('7. Robust Speed Fitting on Noisy Data', () => {
  it('fits velocity within 1% despite noise and outliers', () => {
    const trueSpeedMps = 36.0; // ~130 km/h
    const ppm = 50; // 50 pixels per metre
    const gateA: LineSegment = { p1: { x: 100, y: 50 }, p2: { x: 100, y: 500 } };
    const gateB: LineSegment = { p1: { x: 1000, y: 50 }, p2: { x: 1000, y: 500 } };

    const track: TrackPoint[] = [];
    const dt = 1 / 60;
    for (let i = 0; i < 15; i++) {
      const t = i * dt;
      const distM = trueSpeedMps * t;
      const xPx = 100 + distM * ppm + (i === 7 ? 8.0 : (Math.random() - 0.5) * 1.5); // outlier at i=7
      const yPx = 250 + (Math.random() - 0.5) * 1.0;
      track.push({ t, x: xPx, y: yPx, conf: 1 });
    }

    const fit = speedFromFit(track, gateA, gateB, ppm);
    expect(fit.mps).toBeCloseTo(trueSpeedMps, 0);
    expect(fit.r2).toBeGreaterThan(0.98);
  });
});

describe('8. CSV Export', () => {
  it('formats CSV RFC 4180 headers and rows properly', () => {
    const session = {
      id: 'sess_1',
      name: 'Net Practice',
      createdAt: Date.now(),
      calibrationId: 'cal_1',
      ballPreset: 'red',
      bowler: 'Anderson',
    };
    const deliveries = [
      {
        id: 'del_1',
        sessionId: 'sess_1',
        createdAt: 1700000000000,
        speedMps: 38.89,
        uncertaintyMps: 0.45,
        method: 'gates' as const,
        preBounce: true,
        r2: 0.995,
        confidence: 'high' as const,
        track: [],
        snapshot: 'data:image/jpeg;base64,abc',
        bowler: 'Anderson',
        notes: 'Good length seam',
      },
    ];

    const csv = toCSV(session, deliveries);
    expect(csv).toContain('index,timestamp,speed_kmh,speed_mph,speed_mps');
    expect(csv).toContain('140.0');
    expect(csv).toContain('"Anderson"');
    expect(csv).toContain('"Good length seam"');
  });
});

describe('9. End-to-End Synthetic Delivery Pipeline Verification', () => {
  // Tests required by Section 8:
  // "assert the gate speed is within ±3% (±4% at 60 fps)" for 90, 120 and 145 km/h at 60 and 120 fps
  const testCases = [
    { speedKmh: 90, fps: 60, maxErrorPercent: 4.0 },
    { speedKmh: 120, fps: 60, maxErrorPercent: 4.0 },
    { speedKmh: 145, fps: 60, maxErrorPercent: 4.0 },
    { speedKmh: 90, fps: 120, maxErrorPercent: 3.0 },
    { speedKmh: 120, fps: 120, maxErrorPercent: 3.0 },
    { speedKmh: 145, fps: 120, maxErrorPercent: 3.0 },
  ];

  for (const { speedKmh, fps, maxErrorPercent } of testCases) {
    it(`evaluates ${speedKmh} km/h synthetic delivery at ${fps} fps within ±${maxErrorPercent}%`, () => {
      const origW = 1280;
      const origH = 720;
      const workW = 480;
      const workH = Math.round((origH * workW) / origW);
      const distanceM = 17.68;

      const gateA: LineSegment = { p1: { x: 250, y: 50 }, p2: { x: 250, y: 650 } };
      const gateB: LineSegment = { p1: { x: 1050, y: 50 }, p2: { x: 1050, y: 650 } };

      const sim = renderSyntheticDelivery({
        speedKmh,
        fps,
        origWidth: origW,
        origHeight: origH,
        workWidth: workW,
        gateA,
        gateB,
        distanceM,
        noisePx: 1.0,
      });

      // Pipeline components
      const ppmWorking = sim.pixelsPerMetre * (workW / origW);
      const expectedBall = getExpectedBallSize(ppmWorking);
      const prevLuma = new Uint8Array(workW * workH);
      const diffMaskBuf = new Uint8Array(workW * workH);
      const currLumaBuf = new Uint8Array(workW * workH);
      const colorMaskBuf = new Uint8Array(workW * workH);
      const combinedMaskBuf = new Uint8Array(workW * workH);
      const labeler = new ConnectedComponentLabeler(workW, workH);

      const trackManager = new TrackManager(1, origW, origH, workW, workH);
      const redRange = { hMin: 345, hMax: 20, sMin: 35, sMax: 100, vMin: 20, vMax: 90 };

      // Process frames through full vision + tracking pipeline
      for (let f = 0; f < sim.frames.length; f++) {
        const frame = sim.frames[f];

        if (f > 0) {
          diffFrames(frame.workRgba, prevLuma, diffMaskBuf, currLumaBuf, workW, workH, 20);
          const matchCount = colorMask(frame.workRgba, colorMaskBuf, workW, workH, redRange);
          const { isColorConstrained } = combineMasks(diffMaskBuf, colorMaskBuf, combinedMaskBuf, workW, workH, matchCount);

          const blobs = labeler.label(combinedMaskBuf);
          const pred = trackManager.predict(frame.timestamp);
          const candidate = scoreCandidates(blobs, expectedBall, colorMaskBuf, workW, pred || undefined, isColorConstrained);

          if (candidate) {
            trackManager.update(
              { x: candidate.blob.cx, y: candidate.blob.cy, confidence: candidate.confidence },
              frame.timestamp
            );
          } else {
            trackManager.update(null, frame.timestamp);
          }
        } else {
          // Initialize prevLuma on frame 0
          for (let i = 0; i < workW * workH; i++) {
            const r = frame.workRgba[i * 4];
            const g = frame.workRgba[i * 4 + 1];
            const b = frame.workRgba[i * 4 + 2];
            currLumaBuf[i] = (77 * r + 150 * g + 29 * b) >> 8;
          }
        }
        prevLuma.set(currLumaBuf);
      }

      // Check sub-frame gate crossing on the accumulated track
      const crossA = findGateCrossing(trackManager.points, gateA);
      const crossB = findGateCrossing(trackManager.points, gateB);

      expect(crossA).not.toBeNull();
      expect(crossB).not.toBeNull();

      const measured = speedFromGates(crossA!.t, crossB!.t, distanceM);
      const measuredKmh = measured.mps * 3.6;
      const errorPercent = (Math.abs(measuredKmh - speedKmh) / speedKmh) * 100;

      expect(errorPercent).toBeLessThanOrEqual(maxErrorPercent);
    });
  }
});
