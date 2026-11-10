import { ExpectedBallGeometry } from '@/functions/calibration/expectedBallSize';
import { ConnectedBlob } from './labelComponents';

export interface ScoredCandidate {
  blob: ConnectedBlob;
  radius: number;
  confidence: number;
  score: number;
  colorFillRatio: number;
}

export interface PredictionRoi {
  x: number;
  y: number;
  searchRadius: number;
}

/**
 * Filters candidates based on expected ball area and circularity,
 * and computes composite score based on color match, circularity, and proximity to Kalman prediction.
 */
export function scoreCandidates(
  blobs: ConnectedBlob[],
  expectedSize: ExpectedBallGeometry,
  colorMask: Uint8Array,
  imageWidth: number,
  prediction?: PredictionRoi,
  isColorConstrained = true
): ScoredCandidate | null {
  if (blobs.length === 0) return null;

  let bestCandidate: ScoredCandidate | null = null;
  let highestScore = -1;

  for (const blob of blobs) {
    // 1. Filter by area: 0.4x to 4.0x of expected ball size
    if (blob.area < expectedSize.minAreaPx || blob.area > expectedSize.maxAreaPx) {
      continue;
    }

    // 2. Filter by circularity (motion blur tolerant, >= 0.45 threshold)
    // If not color constrained, enforce a slightly stricter threshold of 0.45;
    // if color constrained, allow down to 0.40 under heavy streak blur
    const minCircularity = isColorConstrained ? 0.40 : 0.45;
    if (blob.circularity < minCircularity) {
      continue;
    }

    // 3. Compute color fill ratio inside blob bounding box
    let colorMatchingPixels = 0;
    for (let y = blob.minY; y <= blob.maxY; y++) {
      const rowOffset = y * imageWidth;
      for (let x = blob.minX; x <= blob.maxX; x++) {
        if (colorMask[rowOffset + x] > 0) {
          colorMatchingPixels++;
        }
      }
    }
    const colorFillRatio = isColorConstrained
      ? Math.min(1.0, colorMatchingPixels / Math.max(1, blob.area))
      : 1.0;

    // 4. Proximity to Kalman prediction factor (0..1)
    let proximityFactor = 1.0;
    if (prediction) {
      const dist = Math.hypot(blob.cx - prediction.x, blob.cy - prediction.y);
      if (dist > prediction.searchRadius) {
        // Outside ROI search window
        continue;
      }
      // Gaussian-like falloff within search radius
      proximityFactor = Math.max(0.2, 1.0 - (dist / prediction.searchRadius) * 0.8);
    }

    // 5. Composite Score = colorFillRatio * circularity * proximityFactor
    // We boost score slightly if area is close to nominal
    const areaRatio = blob.area / expectedSize.nominalAreaPx;
    const areaCloseness = Math.exp(-Math.pow(Math.log(Math.max(0.1, areaRatio)), 2) / 2);

    const score = (colorFillRatio * 0.35 + 0.65) * blob.circularity * proximityFactor * (0.8 + 0.2 * areaCloseness);
    const confidence = Math.min(1.0, score);

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = {
        blob,
        radius: Math.max(1.5, (blob.width + blob.height) / 4),
        confidence,
        score,
        colorFillRatio,
      };
    }
  }

  return bestCandidate;
}
