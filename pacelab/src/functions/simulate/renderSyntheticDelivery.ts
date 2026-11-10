import { CRICKET_BALL_DIAMETER_M } from '@/constants';
import { LineSegment } from '@/types';

export interface SyntheticDeliveryParams {
  speedKmh: number;
  fps: number;
  origWidth: number;
  origHeight: number;
  workWidth: number;
  gateA: LineSegment;
  gateB: LineSegment;
  distanceM: number;
  noisePx?: number;
  ballRgb?: [number, number, number];
  pitchY?: number;
  hasBounce?: boolean;
}

export interface SyntheticFrame {
  frameIndex: number;
  timestamp: number;
  workRgba: Uint8ClampedArray;
  trueX: number;
  trueY: number;
}

/**
 * Generates synthetic frame sequence of a cricket ball travelling across the pitch at a known velocity
 * with motion blur, sub-pixel positioning, background texture, and sensor noise.
 */
export function renderSyntheticDelivery(params: SyntheticDeliveryParams): {
  frames: SyntheticFrame[];
  pixelsPerMetre: number;
  trueSpeedMps: number;
} {
  const {
    speedKmh,
    fps,
    origWidth,
    origHeight,
    workWidth,
    gateA,
    gateB,
    distanceM,
    noisePx = 1.0,
    ballRgb = [210, 35, 35], // Red cricket ball
    pitchY = origHeight * 0.72,
    hasBounce = false,
  } = params;

  const trueSpeedMps = speedKmh / 3.6;
  const workHeight = Math.round((origHeight * workWidth) / origWidth);
  const scale = workWidth / origWidth;

  const midA = { x: (gateA.p1.x + gateA.p2.x) / 2, y: (gateA.p1.y + gateA.p2.y) / 2 };
  const midB = { x: (gateB.p1.x + gateB.p2.x) / 2, y: (gateB.p1.y + gateB.p2.y) / 2 };
  const gatePixelDistance = Math.hypot(midB.x - midA.x, midB.y - midA.y);
  const pixelsPerMetre = gatePixelDistance / distanceM;

  // Ball velocity in original pixels per second
  const vxOrig = trueSpeedMps * pixelsPerMetre; // along X direction
  const dt = 1 / fps;

  // Start ball 150 px before gate A in orig coordinates
  const startX = midA.x - 150;
  const endX = midB.x + 150;
  const totalDist = endX - startX;
  const totalDuration = totalDist / vxOrig;
  const totalFrames = Math.ceil(totalDuration * fps);

  // Ball radius in working frame
  const ballRadiusWork = Math.max(3, Math.round((CRICKET_BALL_DIAMETER_M * pixelsPerMetre * scale) / 2));

  // Generate realistic pitch strip background texture for work resolution (clay/turf strip)
  const bgLuma = new Uint8Array(workWidth * workHeight);
  for (let y = 0; y < workHeight; y++) {
    for (let x = 0; x < workWidth; x++) {
      // Cricket pitch strip has light clay/dry grass tone (luma ~155 with subtle turf grain)
      const noise = ((x * 17 + y * 31) % 15) - 7;
      bgLuma[y * workWidth + x] = Math.min(255, Math.max(0, 155 + noise));
    }
  }

  const frames: SyntheticFrame[] = [];

  for (let f = 0; f < totalFrames; f++) {
    const t = f * dt;
    const xOrig = startX + vxOrig * t;

    // Trajectory in y: slight parabolic arc, optionally with bounce
    let yOrig = pitchY - 60;
    if (hasBounce) {
      const bounceX = (midA.x + midB.x) / 2;
      const progress = (xOrig - startX) / totalDist;
      if (xOrig < bounceX) {
        yOrig = pitchY - 70 + Math.pow(progress * 2, 2) * 55;
      } else {
        yOrig = pitchY - 15 - Math.sin((progress - 0.5) * Math.PI) * 45;
      }
    } else {
      // Gentle downward trajectory
      yOrig = (pitchY - 80) + (xOrig / origWidth) * 40;
    }

    // Add noise to ground truth measurement
    const noisyX = xOrig + (Math.random() - 0.5) * noisePx;
    const noisyY = yOrig + (Math.random() - 0.5) * noisePx;

    // Convert to working frame coordinates
    const workX = noisyX * scale;
    const workY = noisyY * scale;

    // Allocate RGBA buffer for this synthetic frame
    const rgba = new Uint8ClampedArray(workWidth * workHeight * 4);

    // Render background
    for (let i = 0; i < workWidth * workHeight; i++) {
      const idx = i * 4;
      const l = bgLuma[i];
      rgba[idx] = l - 20;     // R
      rgba[idx + 1] = l + 15; // G (greenish turf)
      rgba[idx + 2] = l - 30; // B
      rgba[idx + 3] = 255;
    }

    // Motion blur streak length in working pixels
    const blurPx = Math.max(1, (vxOrig * scale) * dt * 0.7);

    // Draw ball with motion blur along X
    const minBx = Math.max(0, Math.floor(workX - ballRadiusWork - blurPx));
    const maxBx = Math.min(workWidth - 1, Math.ceil(workX + ballRadiusWork + blurPx));
    const minBy = Math.max(0, Math.floor(workY - ballRadiusWork * 1.5));
    const maxBy = Math.min(workHeight - 1, Math.ceil(workY + ballRadiusWork * 1.5));

    for (let py = minBy; py <= maxBy; py++) {
      for (let px = minBx; px <= maxBx; px++) {
        const dy = py - workY;
        // Distance to motion line segment from (workX - blurPx/2) to (workX + blurPx/2)
        const clampedX = Math.max(workX - blurPx / 2, Math.min(workX + blurPx / 2, px));
        const dx = px - clampedX;
        const d = Math.hypot(dx, dy);

        if (d <= ballRadiusWork) {
          const alpha = Math.min(1.0, Math.max(0.2, 1.0 - (d / ballRadiusWork) * 0.4));
          const pIdx = (py * workWidth + px) * 4;

          // Alpha blend ball RGB onto background
          rgba[pIdx] = Math.round(rgba[pIdx] * (1 - alpha) + ballRgb[0] * alpha);
          rgba[pIdx + 1] = Math.round(rgba[pIdx + 1] * (1 - alpha) + ballRgb[1] * alpha);
          rgba[pIdx + 2] = Math.round(rgba[pIdx + 2] * (1 - alpha) + ballRgb[2] * alpha);
        }
      }
    }

    frames.push({
      frameIndex: f,
      timestamp: t,
      workRgba: rgba,
      trueX: xOrig,
      trueY: yOrig,
    });
  }

  return {
    frames,
    pixelsPerMetre,
    trueSpeedMps,
  };
}
