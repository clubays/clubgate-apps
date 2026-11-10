import { CRICKET_BALL_DIAMETER_M } from '@/constants';

export interface ExpectedBallGeometry {
  diameterMeters: number;
  radiusPx: number;
  diameterPx: number;
  nominalAreaPx: number;
  minAreaPx: number;
  maxAreaPx: number;
}

/**
 * Computes expected ball radius and bounding area in pixel units
 * given the calibrated pixels-per-metre scale for the target frame width
 */
export function getExpectedBallSize(pixelsPerMetre: number): ExpectedBallGeometry {
  const diameterM = CRICKET_BALL_DIAMETER_M; // 0.072m
  const diameterPx = Math.max(2, diameterM * pixelsPerMetre);
  const radiusPx = diameterPx / 2;
  const nominalArea = Math.PI * radiusPx * radiusPx;

  // Accept blobs from small sub-sampled ball up to fast motion-blurred streaks
  const minAreaPx = Math.max(2, Math.round(nominalArea * 0.2));
  const maxAreaPx = Math.max(140, Math.round(nominalArea * 15.0));

  return {
    diameterMeters: diameterM,
    radiusPx,
    diameterPx,
    nominalAreaPx: nominalArea,
    minAreaPx,
    maxAreaPx,
  };
}
