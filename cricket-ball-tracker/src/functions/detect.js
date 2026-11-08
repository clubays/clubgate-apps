import { PITCH } from '../data/landmarks.js';
import { extractBlobs } from './blobs.js';
import { getMetresPerPixel } from './calibration.js';
import { computeColorMatchScore, matchBallColor, rgbToHsv } from './colour.js';

export class ClassicalBallDetector {
  constructor() {
    this.bg = null; // Float32Array running background
    this.prevG = null; // Uint8Array previous grayscale frame
    this.width = 0;
    this.height = 0;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.bg = null;
    this.prevG = null;
  }

  reset() {
    this.bg = null;
    this.prevG = null;
  }

  /**
   * Detect ball candidates in an RGBA frame
   * @param {ImageData|{data: Uint8ClampedArray, width: number, height: number}} imageData
   * @param {Object} options
   */
  detect(imageData, options = {}) {
    const {
      t = 0,
      calibration = null,
      ballPreset = 'red',
      ignoreZones = [],
      coordScale = 1.0, // Scale from working resolution to original video resolution
    } = options;

    const width = imageData.width;
    const height = imageData.height;
    const size = width * height;
    const rgba = imageData.data;

    if (this.width !== width || this.height !== height || !this.bg) {
      this.width = width;
      this.height = height;
      this.bg = new Float32Array(size);
      this.prevG = new Uint8Array(size);

      // Initialize background from first frame
      for (let i = 0; i < size; i++) {
        const p4 = i * 4;
        const g = 0.299 * rgba[p4] + 0.587 * rgba[p4 + 1] + 0.114 * rgba[p4 + 2];
        this.bg[i] = g;
        this.prevG[i] = g;
      }
    }

    const currG = new Uint8Array(size);
    let totalAbsDiff = 0;

    for (let i = 0; i < size; i++) {
      const p4 = i * 4;
      const g = 0.299 * rgba[p4] + 0.587 * rgba[p4 + 1] + 0.114 * rgba[p4 + 2];
      currG[i] = g;
      totalAbsDiff += Math.abs(g - this.bg[i]);
    }

    const meanAbsDiff = totalAbsDiff / size;
    const T = Math.max(14, 2.5 * meanAbsDiff);

    // Build raw motion and colour mask
    const rawMask = new Uint8Array(size);
    const motionStrengthArr = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      const g = currG[i];
      const bgVal = this.bg[i];
      const prevVal = this.prevG[i];

      const diffBg = Math.abs(g - bgVal);
      const diffPrev = Math.abs(g - prevVal);
      const isMotion = diffBg > T && diffPrev > 8;

      const p4 = i * 4;
      const [h, s, v] = rgbToHsv(rgba[p4], rgba[p4 + 1], rgba[p4 + 2]);
      const isColor = matchBallColor(h, s, v, ballPreset);

      motionStrengthArr[i] = Math.min(255, diffBg);

      if (ballPreset === 'any') {
        if (isMotion) rawMask[i] = 1;
      } else {
        // High confidence if motion AND color, OR color match with some motion
        if ((isMotion && isColor) || (isColor && diffBg > 10)) {
          rawMask[i] = 1;
        }
      }
    }

    // 1px morphological dilation
    const dilatedMask = new Uint8Array(size);
    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      for (let x = 1; x < width; x++) {
        const idx = rowOffset + x;
        if (rawMask[idx] === 1) {
          dilatedMask[idx] = 1;
          dilatedMask[idx - 1] = 1;
          dilatedMask[idx + 1] = 1;
          dilatedMask[idx - width] = 1;
          dilatedMask[idx + width] = 1;
        }
      }
    }

    // Connected components extraction
    const blobs = extractBlobs(dilatedMask, width, height, rgba);

    // Score blobs
    const candidates = [];

    for (const b of blobs) {
      // Full resolution coordinates
      const fullX = b.x * coordScale;
      const fullY = b.y * coordScale;
      const fullRadius = b.radius * coordScale;
      const fullDiameter = fullRadius * 2;

      // Ignore zones check
      let inIgnoreZone = false;
      for (const zone of ignoreZones) {
        if (
          fullX >= zone.x &&
          fullX <= zone.x + zone.width &&
          fullY >= zone.y &&
          fullY <= zone.y + zone.height
        ) {
          inIgnoreZone = true;
          break;
        }
      }
      if (inIgnoreZone) continue;

      // Expected diameter calculation
      let dExpected = 14; // Default sensible pixel diameter at 640px
      if (calibration && calibration.H) {
        try {
          const mPerPx = getMetresPerPixel(calibration.H, fullX, fullY);
          if (mPerPx > 0 && !isNaN(mPerPx)) {
            // Expected diameter in full-res pixels
            const expectedFullPx = PITCH.ballDiameter / mPerPx;
            dExpected = expectedFullPx;
          }
        } catch {
          dExpected = 14 * coordScale;
        }
      } else {
        dExpected = 14 * coordScale;
      }

      // Allow 0.4x to 3.0x expected size
      if (fullDiameter < 0.4 * dExpected || fullDiameter > 3.0 * dExpected) {
        continue;
      }

      const sizeDiff = Math.abs(fullDiameter - dExpected);
      const sizeMatch = Math.exp(-((sizeDiff / (0.6 * dExpected)) ** 2));
      const circularity = b.circularity;
      const colourMatch = computeColorMatchScore(b.meanR, b.meanG, b.meanB, ballPreset);

      const bCenterIdx = Math.floor(b.y) * width + Math.floor(b.x);
      const mVal = motionStrengthArr[bCenterIdx] || 0;
      const motionStrength = Math.min(1.0, mVal / 40);

      const score =
        0.35 * sizeMatch +
        0.25 * circularity +
        0.25 * colourMatch +
        0.15 * motionStrength;

      if (score >= 0.25) {
        candidates.push({
          t,
          x: fullX,
          y: fullY,
          r: fullRadius,
          area: b.area * coordScale * coordScale,
          score,
          circularity,
          colourMatch,
          sizeMatch,
        });
      }
    }

    // Sort descending by score and pick top 5
    candidates.sort((a, b) => b.score - a.score);
    const topCandidates = candidates.slice(0, 5);

    // Update running background: B = B + alpha*(G - B), frozen where motion was detected
    const alpha = 0.05;
    for (let i = 0; i < size; i++) {
      if (dilatedMask[i] === 0) {
        this.bg[i] += alpha * (currG[i] - this.bg[i]);
      }
      this.prevG[i] = currG[i];
    }

    return topCandidates;
  }
}

export function createDetector() {
  return new ClassicalBallDetector();
}
